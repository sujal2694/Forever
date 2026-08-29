import mongoose from "mongoose";

export const orderSchema = mongoose.Schema({
    userId: { type: String, required: true },
    addressId: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    deliveryFee: { type: Number, required: true, default: 0 },
    items: [
        {
            product: { type: String, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            size: { type: String, required: true }
        },
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: "placed" },
    paymentStatus: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now },
});

export const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);