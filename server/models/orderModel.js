import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        address: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },
        shippingAddress: {
            fullName: { type: String },
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            country: { type: String },
            phone: { type: String },
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: (v) => Array.isArray(v) && v.length > 0,
        },
        itemsTotal: { type: Number, required: true },
        deliveryFee: { type: Number, default: 0 },
        amount: { type: Number, required: true },
        paymentMethod: { type: String, enum: ["COD", "STRIPE", "RAZORPAY"], default: "COD" },
        payment: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ["Order Placed", "Packing", "Shipped", "Out for delivery", "Delivered", "Cancelled"],
            default: "Order Placed",
        },
    },
    { timestamps: true }
);

export const orderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);