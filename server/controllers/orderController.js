import Stripe from "stripe";
import mongoose from "mongoose";
import { orderModel } from "../models/orderModel.js";
import { addressModel } from "../models/addressModel.js";
import { userModel } from "../models/userModel.js";
import { productModel } from "../models/productModel.js";
import { subscriptionModel } from "../models/subscriptionModel.js";
import { sendError, sendSuccess } from "../utils/response.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
});

const adjustStock = async (items, multiplier, session) => {
    for (const item of items) {
        const options = session ? { session } : {};
        const result = await productModel.updateOne(
            {
                _id: item.product,
                sizes: { $elemMatch: { size: item.size.toUpperCase(), stock: { $gte: multiplier < 0 ? item.quantity : 0 } } },
            },
            { $inc: { "sizes.$.stock": item.quantity * multiplier } },
            options
        );
        if (multiplier < 0 && result.modifiedCount !== 1) {
            const error = new Error("One or more items are out of stock.");
            error.code = "OUT_OF_STOCK";
            throw error;
        }
    }
};

export const placeOrder = async (req, res) => {
    let session;
    try {
        const userId = req.userId;
        const { addressId, paymentMethod, deliveryFee, items, origin } = req.body;

        if (!userId || !addressId || !paymentMethod || !Array.isArray(items) || items.length === 0) {
            return sendError(res, "Address, payment method, and at least one item are required", 400);
        }

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return sendError(res, "Invalid delivery address", 400);
        }

        if (!["COD", "STRIPE"].includes(paymentMethod)) {
            return sendError(res, "Invalid payment method", 400);
        }

        // Every item must have a size, or the order line is meaningless for clothes.
        const invalidItem = items.find(
            (item) => !item.product || !item.size || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0
        );
        if (invalidItem) {
            return sendError(res, "Each item must include a valid product, size, and quantity", 400);
        }

        const normalizedDeliveryFee = Number(deliveryFee || 0);
        if (!Number.isFinite(normalizedDeliveryFee) || normalizedDeliveryFee < 0) {
            return sendError(res, "Invalid delivery fee", 400);
        }

        const productIds = [...new Set(items.map((item) => String(item.product)))];
        const products = await productModel.find({ _id: { $in: productIds } });
        const productsById = new Map(products.map((product) => [String(product._id), product]));
        const normalizedItems = [];

        for (const item of items) {
            const product = productsById.get(String(item.product));
            const size = String(item.size).toUpperCase();
            const quantity = Number(item.quantity);
            const hasSize = product?.sizes?.some((entry) => String(entry.size).toUpperCase() === size);

            if (!product || !hasSize) {
                return sendError(res, "One or more products or sizes are invalid", 400);
            }

            normalizedItems.push({
                product: String(product._id),
                name: product.name,
                price: product.price,
                quantity,
                size,
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return sendError(res, "User not found", 404);
        }

        const address = await addressModel.findOne({ _id: addressId, userId });
        if (!address) {
            return sendError(res, "Delivery address not found for this account", 404);
        }

        const itemsSubtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const subscription = await subscriptionModel.findOne({
            email: String(user.email || "").trim().toLowerCase(),
            status: "active",
        });
        const discountAmount = subscription ? Number((itemsSubtotal * 0.2).toFixed(2)) : 0;
        const totalAmount = itemsSubtotal - discountAmount + normalizedDeliveryFee;

        if (paymentMethod === "STRIPE" && !origin) {
            return sendError(res, "Missing origin for Stripe checkout", 400);
        }

        session = await mongoose.startSession();
        session.startTransaction();

        if (paymentMethod !== "STRIPE") {
            const newOrder = new orderModel({
                userId,
                addressId,
                paymentMethod,
                deliveryFee: normalizedDeliveryFee,
                items: normalizedItems,
                totalAmount,
                discountAmount,
            });

            await adjustStock(normalizedItems, -1, session);
            const savedOrder = await newOrder.save({ session });
            await session.commitTransaction();
            session.endSession();
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            return sendSuccess(res, { order: savedOrder });
        }

        // paymentMethod === "STRIPE"
        const pendingOrder = new orderModel({
            userId,
            addressId,
            paymentMethod,
            deliveryFee: normalizedDeliveryFee,
            items: normalizedItems,
            totalAmount,
            discountAmount,
            status: "pending",
            paymentStatus: "pending",
        });

        await adjustStock(normalizedItems, -1, session);
        const savedOrder = await pendingOrder.save({ session });
        await session.commitTransaction();
        session.endSession();

        const successUrl = `${origin.replace(/\/$/, "")}/verify?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${origin.replace(/\/$/, "")}/cancel-stripe?session_id={CHECKOUT_SESSION_ID}`;

        const line_items = normalizedItems.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    // Size baked into the product name so it shows on Stripe's
                    // checkout page and the customer's receipt/email.
                    name: `${item.name} (Size: ${item.size})`,
                },
                unit_amount: Math.round(item.price * (subscription ? 0.8 : 1) * 100),
            },
            quantity: item.quantity,
        }));

        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items,
            customer_email: user.email,
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                orderId: savedOrder._id.toString(),
            },
        });

        return sendSuccess(res, { session_url: checkoutSession.url, order: savedOrder });

    } catch (error) {
        if (session?.inTransaction()) await session.abortTransaction();
        if (session) await session.endSession();
        console.error("Error placing order:", error);
        if (error.code === "OUT_OF_STOCK") return sendError(res, error.message, 409);
        return sendError(res, "Failed to place order");
    }
};

export const verifyStripePayment = async (req, res) => {
    try {
        const { session_id } = req.query;
        const userId = req.userId;

        if (!session_id) {
                return sendError(res, "Missing Stripe session id", 400);
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (!session || session.payment_status !== "paid") {
            return sendError(res, "Payment not completed", 402);
        }

        const orderId = session.metadata?.orderId;
        if (!orderId) {
            return sendError(res, "Order reference not found", 404);
        }

        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            { status: "paid", paymentStatus: "paid" },
            { new: true }
        );

        if (!updatedOrder) {
            return sendError(res, "Order not found", 404);
        }

        if (userId) {
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
        }

        return sendSuccess(res, { order: updatedOrder, session });
    } catch (error) {
        console.error("Error verifying Stripe payment:", error);
        return sendError(res, "Failed to verify payment");
    }
};

export const cancelStripePayment = async (req, res) => {
    try {
        const { session_id } = req.query;
        const userId = req.userId;

        if (!session_id) {
            return sendError(res, "Missing Stripe session id", 400);
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);
        const orderId = session?.metadata?.orderId;

        if (orderId) {
            const cancelledOrder = await orderModel.findOneAndUpdate(
                { _id: orderId, status: "pending" },
                { status: "cancelled", paymentStatus: "cancelled" },
                { new: true }
            );
            if (cancelledOrder) await adjustStock(cancelledOrder.items, 1);
        }

        if (userId) {
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
        }

        return sendSuccess(res, { message: "Stripe payment cancelled" });
    } catch (error) {
        console.error("Error cancelling Stripe payment:", error);
        return sendError(res, "Failed to cancel Stripe payment");
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { userId } = req;
        const { orderId } = req.params;

        if (!userId) {
            return sendError(res, "User not authorized", 401);
        }

        const order = await orderModel.findById(orderId);
        if (!order || order.userId.toString() !== userId.toString()) {
            return sendError(res, "Order not found or unauthorized", 404);
        }

        if (["delivered", "shipped", "out-for-delivery"].includes(order.status)) {
            return sendError(res, "This order can no longer be cancelled.", 409);
        }

        order.status = "cancelled";
        order.paymentStatus = "cancelled";
        await order.save();

        return sendSuccess(res, { message: "Order cancelled successfully", order });
    } catch (error) {
        console.error("Error cancelling order:", error);
        return sendError(res, "Failed to cancel order");
    }
};

export const listOrders = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return sendError(res, "User not authorized", 401);
        }

        const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });
        return sendSuccess(res, { orders });
    } catch (error) {
        console.error("Error listing orders:", error);
        return sendError(res, "Failed to fetch orders");
    }
};

export const adminListOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        return sendSuccess(res, { orders });
    } catch (error) {
        console.log(error);
        return sendError(res, 'Orders not fetched.')
    }
}

export const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return sendError(res, "orderId and status are required", 400);
        }

        const validStatuses = [
            "placed",
            "packing",
            "shipped",
            "out-for-delivery",
            "delivered",
            "cancelled",
        ];

        if (!validStatuses.includes(status)) {
            return sendError(res, "Invalid status value", 400);
        }

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return sendError(res, "Invalid order id", 400);
        }

        const order = await orderModel.findByIdAndUpdate(
            orderId,
            { $set: { status } },
            { new: true, runValidators: true }
        );

        if (!order) {
            return sendError(res, "Order not found", 404);
        }

        return sendSuccess(res, { message: "Order status updated", order });

    } catch (error) {
        console.error("Update order status error:", error);
        sendError(res, "Error updating order status");
    }
};