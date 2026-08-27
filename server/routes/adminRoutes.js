import e from "express";
import { loginAdmin, registerAdmin } from "../controllers/adminController.js";

export const adminRouter = e.Router();

adminRouter.post("/register", registerAdmin);
adminRouter.post("/login", loginAdmin);