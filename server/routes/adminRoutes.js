import e from "express";
import { getAdminDetails, loginAdmin, registerAdmin } from "../controllers/adminController.js";
import { adminAuthMiddleware } from "../middleware/adminMiddleware.js";
import rateLimit from "express-rate-limit";

export const adminRouter = e.Router();

const adminLoginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { success: false, message: "Too many attempts. Please try again later." },
});

adminRouter.post("/register", adminLoginLimiter, registerAdmin);
adminRouter.post("/login", adminLoginLimiter, loginAdmin);
adminRouter.get("/profile", adminAuthMiddleware, getAdminDetails);