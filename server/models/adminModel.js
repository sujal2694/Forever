import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    orgname: { type: String, required: true, trim: true },
    ownname: { type: String, required: true, trim: true },
    number: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }
})

export const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema);