import mongoose from "mongoose";

const VALID_SIZES = ["S", "M", "L", "XL", "XXL"];

const productSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        subcategory: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        sizes: {
            type: [
                {
                    type: String,
                    enum: VALID_SIZES,
                },
            ],
            required: true,
            validate: {
                validator: (arr) =>
                    Array.isArray(arr) && arr.length > 0,
                message: "At least one size is required.",
            },
        },

        images: {
            type: [String],
            required: true,
            validate: {
                validator: (arr) =>
                    Array.isArray(arr) && arr.length > 0,
                message: "At least one image is required.",
            },
        },

        bestseller: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const productModel =
    mongoose.models.product ||
    mongoose.model("product", productSchema);