import { productModel } from "../models/productModel.js";
import fs from "fs/promises";
import path from "path";

const VALID_SIZES = ["S", "M", "L", "XL", "XXL"];

const parseSizes = (sizes) => {
    const parsed = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed.map((entry) => ({
        size: String(typeof entry === "string" ? entry : entry?.size || "").toUpperCase(),
        stock: typeof entry === "string" ? 0 : Number(entry?.stock),
    }));
};

const validateSizes = (sizes) => {
    if (!sizes) return "At least one size is required.";
    const invalid = sizes.find(
        (entry) => !VALID_SIZES.includes(entry.size) || !Number.isInteger(entry.stock) || entry.stock < 0
    );
    if (invalid) return `Invalid stock or size: ${invalid.size}`;
    if (new Set(sizes.map((entry) => entry.size)).size !== sizes.length) return "Each size can only be listed once.";
    return null;
};

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
            parsedSizes = parseSizes(sizes);
        } catch (error) {
            parsedSizes = null;
        }

        const sizeError = validateSizes(parsedSizes);
        if (sizeError) {
            return res.json({
                success: false,
                message: sizeError,
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
            sizes: parsedSizes,
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

export const getProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        return res.json({
            success: true,
            product,
        });
    } catch (error) {
        console.log("GET PRODUCT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch product.",
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

export const updateProduct = async (req, res) => {
    const uploadedFiles = req.files || [];
    try {
        const { id, name, category, subcategory, description, price, sizes, bestseller } = req.body;
        const product = id ? await productModel.findById(id) : null;
        if (!product) return res.json({ success: false, message: "Product not found." });

        const parsedPrice = Number(price);
        let parsedSizes;
        try {
            parsedSizes = parseSizes(sizes);
        } catch (error) {
            parsedSizes = null;
        }
        const sizeError = validateSizes(parsedSizes);
        if (!name || !category || !subcategory || !description || !Number.isFinite(parsedPrice) || parsedPrice < 0 || sizeError) {
            return res.json({ success: false, message: sizeError || "Please provide valid product details." });
        }

        Object.assign(product, {
            name: name.trim(), category: category.trim(), subcategory: subcategory.trim(),
            description: description.trim(), price: parsedPrice, sizes: parsedSizes,
            bestseller: bestseller === "true" || bestseller === true,
        });
        if (uploadedFiles.length > 0) product.images = uploadedFiles.map((file) => file.filename);
        await product.save();
        return res.json({ success: true, message: "Product updated successfully.", product });
    } catch (error) {
        await Promise.all(uploadedFiles.map((file) => fs.unlink(file.path).catch(() => {})));
        return res.status(500).json({ success: false, message: error.message || "Unable to update product." });
    }
};