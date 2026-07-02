import e from "express";
import rateLimit from 'express-rate-limit'
import { addAddress, listAddresses, editAddress, deleteAddress } from "../controllers/addressController.js";

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
})

const addressRouter = e.Router();

// Apply to all routes
addressRouter.use(limiter);

addressRouter.get("/list-address", listAddresses);

addressRouter.post("/add-address", addAddress);

addressRouter.patch("/edit-address/:id", editAddress);

addressRouter.delete("/delete-address/:id", deleteAddress);

export default addressRouter;