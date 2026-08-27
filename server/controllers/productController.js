import { productModel } from "../models/productModel.js";
import fs from "fs/promises";
import path from "path";

const VALID_SIZES = ["S", "M", "L", "XL", "XXL"];

export const addProduct = async (req, res) => {
    const uploadedFiles = req.files || [];

    try {
        // Check images
        if (uploadedFiles.length === 0) {
            return res.json({
                success: false,
                message: "At least one image is required.",
            });
        }

        const {
            _id,
            name,
            category,
            subcategory,
            description,
            price,
            sizes,
            bestseller,
        } = req.body;

        // Check required fields
        if (
            !name ||
            !category ||
            !subcategory ||
            !description
        ) {
            return res.json({
                success: false,
                message: "Please fill all the fields.",
            });
        }

        // Validate price
        const parsedPrice = Number(price);

        if (
            price === undefined ||
            price === "" ||
            Number.isNaN(parsedPrice) ||
            parsedPrice < 0
        ) {
            return res.json({
                success: false,
                message: "Price must be a valid positive number.",
            });
        }

        // Parse sizes
        let parsedSizes;

        try {
            parsedSizes =
                typeof sizes === "string"
                    ? JSON.parse(sizes)
                    : sizes;
        } catch (error) {
            parsedSizes = null;
        }

        if (
            !Array.isArray(parsedSizes) ||
            parsedSizes.length === 0
        ) {
            return res.json({
                success: false,
                message: "At least one size is required.",
            });
        }

        // Normalize sizes
        const normalizedSizes = parsedSizes.map((size) =>
            String(size).toUpperCase()
        );

        // Check valid sizes
        const invalidSize = normalizedSizes.find(
            (size) => !VALID_SIZES.includes(size)
        );

        if (invalidSize) {
            return res.json({
                success: false,
                message: `Invalid size: ${invalidSize}`,
            });
        }

        // Get uploaded image filenames
        const images = uploadedFiles.map(
            (file) => file.filename
        );

        // Create product
        const product = new productModel({
            _id: _id,
            name: name.trim(),
            category: category.trim(),
            subcategory: subcategory.trim(),
            description: description.trim(),
            price: parsedPrice,
            sizes: normalizedSizes,
            images,
            bestseller:
                bestseller === "true" ||
                bestseller === true,
        });

        await product.save();

        return res.json({
            success: true,
            message: "Product added successfully.",
            product,
        });
    } catch (error) {
        console.log("ADD PRODUCT ERROR:", error);

        // Delete uploaded files if something failed
        await Promise.all(
            uploadedFiles.map((file) =>
                fs.unlink(file.path).catch(() => {})
            )
        );

        return res.status(500).json({
            success: false,
            message: error.message || "Unable to add product.",
        });
    }
};

export const listProduct = async (req, res) => {
    try {
        const products = await productModel
            .find({})
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.log("LIST PRODUCT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch product list.",
        });
    }
};

export const removeProduct = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.json({
                success: false,
                message: "Product id is required.",
            });
        }

        const product = await productModel.findById(id);

        if (!product) {
            return res.json({
                success: false,
                message: "Product not found.",
            });
        }

        // Delete product from database
        await productModel.findByIdAndDelete(id);

        // Delete product images
        await Promise.all(
            (product.images || []).map((image) =>
                fs
                    .unlink(path.join("uploads", image))
                    .catch(() => {})
            )
        );

        return res.json({
            success: true,
            message: "Product removed successfully.",
        });
    } catch (error) {
        console.log("REMOVE PRODUCT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to remove this product.",
        });
    }
};