import Stripe from "stripe";
import mongoose from "mongoose";
import { orderModel } from "../models/orderModel.js";
import { addressModel } from "../models/addressModel.js";
import { userModel } from "../models/userModel.js";
import { productModel } from "../models/productModel.js";
import { subscriptionModel } from "../models/subscriptionModel.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { isSafeProductId } from "../utils/productId.js";

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
    : null;
const MAX_ORDER_LINES = 30;
const MAX_QTY_PER_LINE = 10; 
const SUBSCRIBER_DISCOUNT_RATE = 0.2;

const ALLOWED_ORIGINS = (process.env.CLIENT_URLS || "http://localhost:3000")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);

// Delivery fee is decided on the server. Make this match what your frontend shows.
const FLAT_DELIVERY_FEE = Number.isFinite(Number(process.env.DELIVERY_FEE))
    ? Number(process.env.DELIVERY_FEE)
    : 10;
const FREE_DELIVERY_ABOVE = Number.isFinite(Number(process.env.FREE_DELIVERY_ABOVE))
    ? Number(process.env.FREE_DELIVERY_ABOVE)
    : 0; // 0 = never free

const calculateDeliveryFee = (subtotal) => {
    if (FREE_DELIVERY_ABOVE > 0 && subtotal >= FREE_DELIVERY_ABOVE) return 0;
    return FLAT_DELIVERY_FEE;
};

const round2 = (n) => Math.round(n * 100) / 100;

export const isValidOrderItem = (item) =>
    isSafeProductId(item?.product) &&
    typeof item.size === "string" &&
    item.size.trim().length > 0 &&
    Number.isInteger(Number(item.quantity)) &&
    Number(item.quantity) > 0;

/* ------------------------------------------------------------------ */
/* Stock helpers                                                       */
/* ------------------------------------------------------------------ */

const adjustStock = async (items, multiplier, session) => {
    for (const item of items) {
        const options = session ? { session } : {};
        const result = await productModel.updateOne(
            {
                _id: item.product,
                sizes: {
                    $elemMatch: {
                        size: String(item.size).toUpperCase(),
                        stock: { $gte: multiplier < 0 ? item.quantity : 0 },
                    },
                },
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

// Flips the order to "cancelled" atomically, then returns the stock.
// Because the status flip is atomic, stock can only be restored once per order.
const cancelAndRestock = async (filter) => {
    const order = await orderModel.findOneAndUpdate(
        filter,
        { status: "cancelled", paymentStatus: "cancelled" },
        { new: true }
    );
    if (order) await adjustStock(order.items, 1);
    return order;
};

/* ------------------------------------------------------------------ */
/* Place order                                                         */
/* ------------------------------------------------------------------ */

export const placeOrder = async (req, res) => {
    let session;
    try {
        const userId = req.userId;
        const { addressId, paymentMethod, items, origin } = req.body;

        if (!userId || !addressId || !paymentMethod || !Array.isArray(items) || items.length === 0) {
            return sendError(res, "Address, payment method, and at least one item are required", 400);
        }

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return sendError(res, "Invalid delivery address", 400);
        }

        if (!["COD", "STRIPE"].includes(paymentMethod)) {
            return sendError(res, "Invalid payment method", 400);
        }

        if (items.length > MAX_ORDER_LINES) {
            return sendError(res, `An order can have at most ${MAX_ORDER_LINES} items`, 400);
        }

        // Every item must have a valid product id, size and quantity.
        const invalidItem = items.find((item) => !isValidOrderItem(item));
        if (invalidItem) {
            return sendError(res, "Each item must include a valid product, size, and quantity", 400);
        }

        const isStripe = paymentMethod === "STRIPE";
        if (isStripe && !stripe) {
            return sendError(res, "Online payments are unavailable.", 503);
        }

        // Validate origin before doing any work or touching stock.
        const baseUrl = String(origin || "").trim().replace(/\/$/, "");
        if (isStripe && !baseUrl) {
            return sendError(res, "Missing origin for Stripe checkout", 400);
        }
        if (isStripe && !ALLOWED_ORIGINS.includes(baseUrl)) {
            return sendError(res, "Invalid origin", 400);
        }

        const productIds = [...new Set(items.map((item) => String(item.product)))];
        const products = await productModel.find({ _id: { $in: productIds } });
        const productsById = new Map(products.map((product) => [String(product._id), product]));

        // Merge duplicate product+size lines and use database prices only.
        const merged = new Map();
        for (const item of items) {
            const product = productsById.get(String(item.product));
            const size = String(item.size).trim().toUpperCase();
            const quantity = Number(item.quantity);
            const hasSize = product?.sizes?.some((entry) => String(entry.size).toUpperCase() === size);

            if (!product || !hasSize) {
                return sendError(res, "One or more products or sizes are invalid", 400);
            }

            const key = `${product._id}:${size}`;
            const existing = merged.get(key);
            if (existing) {
                existing.quantity += quantity;
            } else {
                merged.set(key, {
                    product: String(product._id),
                    name: product.name,
                    price: product.price,
                    quantity,
                    size,
                });
            }
        }
        const finalItems = [...merged.values()];

        if (finalItems.some((item) => item.quantity > MAX_QTY_PER_LINE)) {
            return sendError(res, `Maximum ${MAX_QTY_PER_LINE} per item`, 400);
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return sendError(res, "User not found", 404);
        }

        const address = await addressModel.findOne({ _id: addressId, userId });
        if (!address) {
            return sendError(res, "Delivery address not found for this account", 404);
        }

        const itemsSubtotal = finalItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const subscription = await subscriptionModel.findOne({
            email: String(user.email || "").trim().toLowerCase(),
            status: "active",
        });
        const discountAmount = subscription
            ? round2(itemsSubtotal * SUBSCRIBER_DISCOUNT_RATE)
            : 0;
        const deliveryFee = calculateDeliveryFee(itemsSubtotal);
        const totalAmount = round2(itemsSubtotal - discountAmount + deliveryFee);

        // Reserve stock and create the order in one transaction.
        session = await mongoose.startSession();
        session.startTransaction();

        const order = new orderModel({
            userId,
            addressId,
            paymentMethod,
            deliveryFee,
            items: finalItems,
            totalAmount,
            discountAmount,
            ...(isStripe ? { status: "pending", paymentStatus: "pending" } : {}),
        });

        await adjustStock(finalItems, -1, session);
        const savedOrder = await order.save({ session });
        await session.commitTransaction();
        await session.endSession();

        // Cash on delivery: done.
        if (!isStripe) {
            // Clearing the cart must never fail the order (a retry would create a duplicate).
            userModel
                .findByIdAndUpdate(userId, { cartData: {} })
                .catch((e) => console.error("Cart clear failed after COD order:", e));
            return sendSuccess(res, { order: savedOrder });
        }

        // Stripe: build the checkout session.
        const line_items = finalItems.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    // Size is in the name so it shows on Stripe's page and the receipt.
                    name: `${item.name} (Size: ${item.size})`,
                },
                unit_amount: Math.round(
                    item.price * (subscription ? 1 - SUBSCRIBER_DISCOUNT_RATE : 1) * 100
                ),
            },
            quantity: item.quantity,
        }));

        if (deliveryFee > 0) {
            line_items.push({
                price_data: {
                    currency: "usd",
                    product_data: { name: "Delivery fee" },
                    unit_amount: Math.round(deliveryFee * 100),
                },
                quantity: 1,
            });
        }

        let checkoutSession;
        try {
            checkoutSession = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "payment",
                line_items,
                customer_email: user.email,
                success_url: `${baseUrl}/verify?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/cancel-stripe?session_id={CHECKOUT_SESSION_ID}`,
                // Unpaid sessions expire, and the webhook returns the reserved stock.
                expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
                metadata: { orderId: savedOrder._id.toString() },
            });
        } catch (stripeError) {
            // Stripe failed: give the reserved stock back, then let the outer catch respond.
            await cancelAndRestock({ _id: savedOrder._id, status: "pending" });
            throw stripeError;
        }

        return sendSuccess(res, { session_url: checkoutSession.url, order: savedOrder });
    } catch (error) {
        if (session?.inTransaction()) await session.abortTransaction();
        if (session) await session.endSession();
        console.error("Error placing order:", error);
        if (error.code === "OUT_OF_STOCK") return sendError(res, error.message, 409);
        return sendError(res, "Failed to place order", 500);
    }
};

/* ------------------------------------------------------------------ */
/* Stripe                                                              */
/* ------------------------------------------------------------------ */

export const verifyStripePayment = async (req, res) => {
    try {
        if (!stripe) return sendError(res, "Online payments are unavailable.", 503);
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
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return sendError(res, "Order reference not found", 404);
        }

        // Only pending/paid orders can be marked paid (a cancelled order can't be revived),
        // and if we know the user, the order must belong to them.
        const filter = { _id: orderId, status: { $in: ["pending", "paid"] } };
        if (userId) filter.userId = userId;

        const updatedOrder = await orderModel.findOneAndUpdate(
            filter,
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
        return sendError(res, "Failed to verify payment", 500);
    }
};

export const cancelStripePayment = async (req, res) => {
    try {
        if (!stripe) return sendError(res, "Online payments are unavailable.", 503);
        const { session_id } = req.query;
        const userId = req.userId;

        if (!userId) {
            return sendError(res, "User not authorized", 401);
        }
        if (!session_id) {
            return sendError(res, "Missing Stripe session id", 400);
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);
        const orderId = session?.metadata?.orderId;

        if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
            // Only cancel this user's own pending order. The cart is kept so they can retry.
            const cancelled = await cancelAndRestock({ _id: orderId, userId, status: "pending" });

            // Close the Stripe session so it can't be paid after we cancelled the order.
            if (cancelled && session.status === "open") {
                try {
                    await stripe.checkout.sessions.expire(session_id);
                } catch (expireError) {
                    console.error("Could not expire Stripe session:", expireError);
                }
            }
        }

        return sendSuccess(res, { message: "Stripe payment cancelled" });
    } catch (error) {
        console.error("Error cancelling Stripe payment:", error);
        return sendError(res, "Failed to cancel Stripe payment", 500);
    }
};

// Webhook: marks orders paid even if the user closes the tab, and releases stock
// for expired checkouts. Must be registered with express.raw() BEFORE express.json().
export const stripeWebhook = async (req, res) => {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
        return sendError(res, "Payment webhook is not configured.", 503);
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            req.headers["stripe-signature"],
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("Stripe webhook signature check failed:", err.message);
        return res.status(400).send("Webhook signature verification failed");
    }

    try {
        const orderId = event.data.object?.metadata?.orderId;

        if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
            if (event.type === "checkout.session.completed") {
                const result = await orderModel.updateOne(
                    { _id: orderId, status: "pending" },
                    { status: "paid", paymentStatus: "paid" }
                );
                if (result.modifiedCount === 0) {
                    const existing = await orderModel.findById(orderId).select("status");
                    if (existing?.status === "cancelled") {
                        // Customer paid for an order we already cancelled: needs a manual refund.
                        console.error(`Payment received for cancelled order ${orderId}. Refund required.`);
                    }
                }
            } else if (event.type === "checkout.session.expired") {
                await cancelAndRestock({ _id: orderId, status: "pending" });
            }
        }

        return res.json({ received: true });
    } catch (err) {
        console.error("Stripe webhook handling failed:", err);
        return res.status(500).json({ received: false }); // Stripe retries on non-2xx
    }
};

/* ------------------------------------------------------------------ */
/* Customer orders                                                     */
/* ------------------------------------------------------------------ */

export const cancelOrder = async (req, res) => {
    try {
        const { userId } = req;
        const { orderId } = req.params;

        if (!userId) {
            return sendError(res, "User not authorized", 401);
        }
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return sendError(res, "Invalid order id", 400);
        }

        // NOTE: if this order was already paid through Stripe, also issue a refund with
        // stripe.refunds.create(). That needs the payment_intent saved on the order.
        const order = await cancelAndRestock({
            _id: orderId,
            userId,
            status: { $nin: ["delivered", "shipped", "out-for-delivery", "cancelled"] },
        });

        if (!order) {
            return sendError(res, "Order not found or can no longer be cancelled", 404);
        }

        return sendSuccess(res, { message: "Order cancelled successfully", order });
    } catch (error) {
        console.error("Error cancelling order:", error);
        return sendError(res, "Failed to cancel order", 500);
    }
};

export const listOrders = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return sendError(res, "User not authorized", 401);
        }

        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

        const [orders, total] = await Promise.all([
            orderModel
                .find({ userId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            orderModel.countDocuments({ userId }),
        ]);

        return sendSuccess(res, { orders, page, limit, total });
    } catch (error) {
        console.error("Error listing orders:", error);
        return sendError(res, "Failed to fetch orders", 500);
    }
};

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

// Make sure the routes for adminListOrders and updateStatus use an admin-only middleware.
export const adminListOrders = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

        const [orders, total] = await Promise.all([
            orderModel
                .find({})
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            orderModel.countDocuments({}),
        ]);

        return sendSuccess(res, { orders, page, limit, total });
    } catch (error) {
        console.error("Error listing admin orders:", error);
        return sendError(res, "Orders not fetched.", 500);
    }
};

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

        // A cancelled order has had its stock returned, so it can't be moved to another status.
        let order;
        if (status === "cancelled") {
            order = await cancelAndRestock({ _id: orderId, status: { $ne: "cancelled" } });
        } else {
            order = await orderModel.findOneAndUpdate(
                { _id: orderId, status: { $ne: "cancelled" } },
                { $set: { status } },
                { new: true, runValidators: true }
            );
        }

        if (!order) {
            const exists = await orderModel.exists({ _id: orderId });
            if (!exists) return sendError(res, "Order not found", 404);
            return sendError(res, "This order is already cancelled", 409);
        }

        return sendSuccess(res, { message: "Order status updated", order });
    } catch (error) {
        console.error("Update order status error:", error);
        return sendError(res, "Error updating order status", 500);
    }
};