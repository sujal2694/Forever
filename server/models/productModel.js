import mongoose from "mongoose";


export const productSchema = new mongoose.Schema({
    id: {type: String, required: true},
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    subCategoty: {type: String, required: true},
    date: { type: Date, default: Date.now },
})

export const productModel = mongoose.models.product || mongoose.model("product", productSchema)