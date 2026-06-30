import mongoose from "mongoose";

export const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    number: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
})

export const userModel = mongoose.models.model || mongoose.model("user", userSchema);