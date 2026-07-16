import { addressModel } from "../models/addressModel.js";
import { orderModel } from "../models/orderModel.js";
import mongoose from "mongoose";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const currency = process.env.CURRENCY || "usd";

export const placeOrder = async (req, res) => {
    try {
        const { userId, addressId, items, paymentMethod, deliveryFee = 0, origin } = req.body;

        if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
            return res.json({ success: false, message: "A valid delivery address is required" });
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.json({ success: false, message: "Your cart is empty" });
        }

        const address = await addressModel.findOne({ _id: addressId, user: userId });
        if (!address) {
            return res.json({ success: false, message: "Selected address not found" });
        }

        const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const amount = itemsTotal + Number(deliveryFee || 0);

        const shippingAddress = {
            fullName: address.fullName,
            address: address.address,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country,
            phone: address.phone,
        };

        const order = await orderModel.create({
            userId,
            address: address._id,
            shippingAddress,
            items,
            itemsTotal,
            deliveryFee,
            amount,
            paymentMethod: paymentMethod || "COD",
            payment: false,
        });

        // --- Cash on Delivery: done, no payment gateway needed ---
        if (paymentMethod !== "STRIPE") {
            return res.json({ success: true, message: "Order placed", data: order });
        }

        // --- Stripe: build line items and create a Checkout Session ---
        if (!origin) {
            return res.json({ success: false, message: "Missing origin for Stripe redirect" });
        }

        const line_items = items.map((item) => ({
            price_data: {
                currency,
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100), // Stripe wants the smallest currency unit
            },
            quantity: item.quantity,
        }));

        if (deliveryFee > 0) {
            line_items.push({
                price_data: {
                    currency,
                    product_data: { name: "Delivery Fee" },
                    unit_amount: Math.round(deliveryFee * 100),
                },
                quantity: 1,
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: `${origin}/verify?success=true&orderId=${order._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${order._id}`,
        });

        return res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.error("placeOrder error:", error);
        return res.json({ success: false, message: "Failed to place order" });
    }
};

export const verifyStripe = async (req, res) => {
    try {
        const { userId, orderId, success } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.json({ success: false, message: "Invalid order id" });
        }

        const order = await orderModel.findOne({ _id: orderId, userId });
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (success === "true" || success === true) {
            order.payment = true;
            await order.save();
            return res.json({ success: true, message: "Payment verified" });
        } else {
            await Order.findByIdAndDelete(orderId);
            return res.json({ success: false, message: "Payment cancelled" });
        }
    } catch (error) {
        console.error("verifyStripe error:", error);
        return res.json({ success: false, message: "Failed to verify payment" });
    }
};