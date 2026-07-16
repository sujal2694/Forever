import express from "express";
import authMiddleware from "../middleware/nameAuth.js";
export const orderRouter = express.Router();
import {
    placeOrder,
    verifyStripe,
} from "../controllers/orderController.js";

orderRouter.post("/place-order", authMiddleware, placeOrder);
orderRouter.post("/verify-stripe", authMiddleware, verifyStripe);