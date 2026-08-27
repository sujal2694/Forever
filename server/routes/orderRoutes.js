import e from "express";
import { authMiddleware } from "../middleware/nameAuth.js";
import { placeOrder, listOrders, cancelOrder, verifyStripePayment, cancelStripePayment, adminListOrders, updateStatus } from "../controllers/orderController.js";
import { adminAuthMiddleware } from "../middleware/adminMiddleware.js";

export const orderRouter = e.Router();

orderRouter.post("/place-order", authMiddleware, placeOrder);
orderRouter.get("/list-orders", authMiddleware, listOrders);
orderRouter.get("/admin/list-orders", adminListOrders);
orderRouter.get("/verify-stripe", authMiddleware, verifyStripePayment);
orderRouter.get("/cancel-stripe", authMiddleware, cancelStripePayment);
orderRouter.post("/cancel-order/:orderId", authMiddleware, cancelOrder);
orderRouter.post("/admin/update-status", adminAuthMiddleware, updateStatus)
