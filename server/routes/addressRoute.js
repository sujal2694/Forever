import express from "express";
import {
  addAddress,
  listAddresses,
  editAddress,
  deleteAddress,
  getAllAddresses,
} from "../controllers/addressController.js";
import { authMiddleware } from "../middleware/nameAuth.js";
import { adminAuthMiddleware } from "../middleware/adminMiddleware.js";

const addressRouter = express.Router();

// authMiddleware must verify the token and set req.userId before
// these controllers run — that's what scopes every address to its owner.
addressRouter.post("/add-address", authMiddleware, addAddress);
addressRouter.get("/list-address", authMiddleware, listAddresses);
addressRouter.get('/addresses', getAllAddresses)
addressRouter.patch("/edit-address/:id", authMiddleware, editAddress);
addressRouter.delete("/delete-address/:id", authMiddleware, deleteAddress);

export default addressRouter;