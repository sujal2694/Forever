import e from "express";
import { addToCart, getCart, removeFromcart } from "../controllers/cartController.js";
import authMiddleware from "../middleware/nameAuth.js";

export const cartRouter = e.Router();

cartRouter.post("/add-to-cart", authMiddleware, addToCart);
cartRouter.post("/remove-from-cart", authMiddleware, removeFromcart);
cartRouter.post("/get-cart", authMiddleware,getCart);