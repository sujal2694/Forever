import Stripe from "stripe";
import { orderModel } from "../models/orderModel.js";
import { addressModel } from "../models/addressModel.js";
import { userModel } from "../models/userModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
});

export const placeOrder = async (req, res) => {
    try {
        const userId = req.userId || req.body?.userId;
        const { addressId, paymentMethod, deliveryFee, items, origin } = req.body;

        if (!userId || !addressId || !paymentMethod || !Array.isArray(items) || items.length === 0) {
            return res.json({ success: false, message: "Invalid order data" });
        }

        // Every item must have a size, or the order line is meaningless for clothes.
        const invalidItem = items.find(
            (item) => !item.product || !item.size || !item.quantity || item.quantity <= 0
        );
        if (invalidItem) {
            return res.json({ success: false, message: "Each item must include a valid product, size, and quantity" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const address = await addressModel.findById(addressId);
        if (!address) {
            return res.json({ success: false, message: "Delivery address not found" });
        }

        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0) + Number(deliveryFee || 0);

        if (paymentMethod !== "STRIPE") {
            const newOrder = new orderModel({
                userId,
                addressId,
                paymentMethod,
                deliveryFee,
                items,
                totalAmount,
            });

            const savedOrder = await newOrder.save();
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            return res.json({ success: true, order: savedOrder });
        }

        // paymentMethod === "STRIPE"
        const pendingOrder = new orderModel({
            userId,
            addressId,
            paymentMethod,
            deliveryFee,
            items,
            totalAmount,
            status: "pending",
            paymentStatus: "pending",
        });

        const savedOrder = await pendingOrder.save();

        if (!origin) {
            return res.json({ success: false, message: "Missing origin for Stripe checkout" });
        }

        const successUrl = `${origin.replace(/\/$/, "")}/verify?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${origin.replace(/\/$/, "")}/cancel-stripe?session_id={CHECKOUT_SESSION_ID}`;

        const line_items = items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    // Size baked into the product name so it shows on Stripe's
                    // checkout page and the customer's receipt/email.
                    name: `${item.name} (Size: ${item.size})`,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
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

        return res.json({ success: true, session_url: session.url, order: savedOrder });

    } catch (error) {
        console.error("Error placing order:", error);
        return res.json({ success: false, message: "Failed to place order" });
    }
};

export const verifyStripePayment = async (req, res) => {
    try {
        const { session_id } = req.query;
        const userId = req.userId || req.body?.userId;

        if (!session_id) {
            return res.json({ success: false, message: "Missing Stripe session id" });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (!session || session.payment_status !== "paid") {
            return res.json({ success: false, message: "Payment not completed" });
        }

        const orderId = session.metadata?.orderId;
        if (!orderId) {
            return res.json({ success: false, message: "Order reference not found" });
        }

        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            { status: "paid", paymentStatus: "paid" },
            { new: true }
        );

        if (!updatedOrder) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (userId) {
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
        }

        return res.json({ success: true, order: updatedOrder, session });
    } catch (error) {
        console.error("Error verifying Stripe payment:", error);
        return res.json({ success: false, message: "Failed to verify payment" });
    }
};

export const cancelStripePayment = async (req, res) => {
    try {
        const { session_id } = req.query;
        const userId = req.userId || req.body?.userId;

        if (!session_id) {
            return res.json({ success: false, message: "Missing Stripe session id" });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);
        const orderId = session?.metadata?.orderId;

        if (orderId) {
            await orderModel.findByIdAndDelete(orderId);
        }

        if (userId) {
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
        }

        return res.json({ success: true, message: "Stripe payment cancelled and order removed" });
    } catch (error) {
        console.error("Error cancelling Stripe payment:", error);
        return res.json({ success: false, message: "Failed to cancel Stripe payment" });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { userId } = req;
        const { orderId } = req.params;

        if (!userId) {
            return res.json({ success: false, message: "User not authorized" });
        }

        const order = await orderModel.findById(orderId);
        if (!order || order.userId.toString() !== userId.toString()) {
            return res.json({ success: false, message: "Order not found or unauthorized" });
        }

        await orderModel.findByIdAndDelete(orderId);

        return res.json({ success: true, message: "Order cancelled and removed successfully" });
    } catch (error) {
        console.error("Error cancelling order:", error);
        return res.json({ success: false, message: "Failed to cancel order" });
    }
};

export const listOrders = async (req, res) => {
    try {
        const userId = req.userId || req.body?.userId;

        if (!userId) {
            return res.json({ success: false, message: "User not authorized" });
        }

        const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });
        return res.json({ success: true, orders });
    } catch (error) {
        console.error("Error listing orders:", error);
        return res.json({ success: false, message: "Failed to fetch orders" });
    }
};

export const adminListOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        return res.json({ success: true, orders })
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'Orders not fetched.' })
    }
}

export const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.json({ success: false, message: "orderId and status are required" });
        }

        const validStatuses = [
            "placed",
            "packing",
            "shipped",
            "out-for-delivery",
            "delivered",
        ];

        if (!validStatuses.includes(status)) {
            return res.json({ success: false, message: "Invalid status value" });
        }

        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        order.status = status;
        await order.save();

        res.json({ success: true, message: "Order status updated", order });

    } catch (error) {
        console.error("Update order status error:", error);
        res.json({ success: false, message: "Error updating order status" });
    }
};