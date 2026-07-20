import mongoose from "mongoose";

export const addressSchema = mongoose.Schema({
    name: { type: String, required: true },
    number: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String, required: false },
})

export const addressModel = mongoose.models.address || mongoose.model("address", addressSchema);