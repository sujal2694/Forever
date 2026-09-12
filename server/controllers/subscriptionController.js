import { subscriptionModel } from "../models/subscriptionModel.js";
import validator from "validator";
import { sendError, sendSuccess } from "../utils/response.js";


export const placeSubscription = async (req, res) => {
    try {
        const email = String(req.body?.email || "").trim().toLowerCase();

        if (!validator.isEmail(email)) {
            return sendError(res, "Please provide a valid email address.", 400);
        }

        const existingSubscription = await subscriptionModel.findOne({ email });
        if (existingSubscription) {
            return sendSuccess(res, {
                message: "This email is already subscribed.",
                subscription: existingSubscription,
            });
        }

        const subscription = await subscriptionModel.create({ email });
        sendSuccess(res, { subscription }, 201);
    } catch (error) {
        console.error("SUBSCRIPTION ERROR:", error);
        sendError(res, "Unable to subscribe right now. Please try again.");
    }
};

export const getSubscriptionStatus = async (req, res) => {
    try {
        const email = String(req.user?.email || "").trim().toLowerCase();
        const subscription = email
            ? await subscriptionModel.findOne({ email, status: "active" }).select("email status")
            : null;

        return sendSuccess(res, { active: Boolean(subscription), subscription });
    } catch (error) {
        console.error("SUBSCRIPTION STATUS ERROR:", error);
        return sendError(res, "Unable to check subscription status.");
    }
};