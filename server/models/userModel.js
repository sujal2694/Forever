import mongoose from "mongoose";

export const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    number: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
});

export const userModel = mongoose.models.user || mongoose.model("user", userSchema);