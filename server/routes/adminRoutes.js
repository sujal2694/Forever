import e from "express";
import { getAdminDetails, loginAdmin, registerAdmin } from "../controllers/adminController.js";
import { adminAuthMiddleware } from "../middleware/adminMiddleware.js";

export const adminRouter = e.Router();

adminRouter.post("/register", registerAdmin);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/profile", adminAuthMiddleware, getAdminDetails);