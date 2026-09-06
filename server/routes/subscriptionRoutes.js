import express from "express";
import { getSubscriptionStatus, placeSubscription } from "../controllers/subscriptionController.js";
import { authMiddleware } from "../middleware/nameAuth.js";

export const subscriptionRouter = express.Router();

subscriptionRouter.post("/placesubscription", placeSubscription);
subscriptionRouter.get("/status", authMiddleware, getSubscriptionStatus);