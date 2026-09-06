import { subscriptionModel } from "../models/subscriptionModel.js";
import validator from "validator";


export const placeSubscription = async (req, res) => {
    try {
        const email = String(req.body?.email || "").trim().toLowerCase();

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        const existingSubscription = await subscriptionModel.findOne({ email });
        if (existingSubscription) {
            return res.status(200).json({
                success: true,
                message: "This email is already subscribed.",
                subscription: existingSubscription,
            });
        }

        const subscription = await subscriptionModel.create({ email });
        res.status(201).json({ success: true, subscription });
    } catch (error) {
        console.error("SUBSCRIPTION ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Unable to subscribe right now. Please try again.",
        });
    }
};

export const getSubscriptionStatus = async (req, res) => {
    try {
        const email = String(req.user?.email || "").trim().toLowerCase();
        const subscription = email
            ? await subscriptionModel.findOne({ email, status: "active" }).select("email status")
            : null;

        return res.json({
            success: true,
            active: Boolean(subscription),
            subscription,
        });
    } catch (error) {
        console.error("SUBSCRIPTION STATUS ERROR:", error);
        return res.status(500).json({ success: false, message: "Unable to check subscription status." });
    }
};