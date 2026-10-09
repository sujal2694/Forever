import { productModel } from "../models/productModel.js";
import fs from "fs/promises";
import path from "path";
import { sendError, sendSuccess } from "../utils/response.js";
import { UPLOADS_DIR } from "../utils/uploadStorage.js";

const VALID_SIZES = ["S", "M", "L", "XL", "XXL"];

const deleteUploadedFiles = async (files) => Promise.all(
    files.map((file) => fs.unlink(file.path).catch(() => {}))
);

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
            return sendError(res, "At least one image is required.", 400);
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
            await deleteUploadedFiles(uploadedFiles);
            return sendError(res, "Please fill all the fields.", 400);
        }

        // Validate price
        const parsedPrice = Number(price);

        if (
            price === undefined ||
            price === "" ||
            Number.isNaN(parsedPrice) ||
            parsedPrice < 0
        ) {
            await deleteUploadedFiles(uploadedFiles);
            return sendError(res, "Price must be a valid positive number.", 400);
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
            await deleteUploadedFiles(uploadedFiles);
            return sendError(res, sizeError, 400);
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

        return sendSuccess(res, { message: "Product added successfully.", product }, 201);
    } catch (error) {
        console.log("ADD PRODUCT ERROR:", error);

        // Delete uploaded files if something failed
        await deleteUploadedFiles(uploadedFiles);

        return sendError(res, "Unable to add product.");
    }
};

export const listProduct = async (req, res) => {
    try {
        const products = await productModel
            .find({})
            .sort({ createdAt: -1 });

        return sendSuccess(res, { data: products });
    } catch (error) {
        console.log("LIST PRODUCT ERROR:", error);

        return sendError(res, "Unable to fetch product list.");
    }
};

export const getProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);

        if (!product) {
            return sendError(res, "Product not found.", 404);
        }

        return sendSuccess(res, { product });
    } catch (error) {
        console.log("GET PRODUCT ERROR:", error);

        return sendError(res, "Unable to fetch product.");
    }
};

export const removeProduct = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return sendError(res, "Product id is required.", 400);
        }

        const product = await productModel.findById(id);

        if (!product) {
            return sendError(res, "Product not found.", 404);
        }

        // Delete product from database
        await productModel.findByIdAndDelete(id);

        // Delete product images
        await Promise.all(
            (product.images || []).map((image) =>
                fs
                    .unlink(path.join(UPLOADS_DIR, image))
                    .catch(() => {})
            )
        );

        return sendSuccess(res, { message: "Product removed successfully." });
    } catch (error) {
        console.log("REMOVE PRODUCT ERROR:", error);

        return sendError(res, "Unable to remove this product.");
    }
};

export const updateProduct = async (req, res) => {
    const uploadedFiles = req.files || [];
    try {
        const { id, name, category, subcategory, description, price, sizes, bestseller } = req.body;
        const product = id ? await productModel.findById(id) : null;
        if (!product) {
            await deleteUploadedFiles(uploadedFiles);
            return sendError(res, "Product not found.", 404);
        }

        const parsedPrice = Number(price);
        let parsedSizes;
        try {
            parsedSizes = parseSizes(sizes);
        } catch (error) {
            parsedSizes = null;
        }
        const sizeError = validateSizes(parsedSizes);
        if (!name || !category || !subcategory || !description || !Number.isFinite(parsedPrice) || parsedPrice < 0 || sizeError) {
            await deleteUploadedFiles(uploadedFiles);
            return sendError(res, sizeError || "Please provide valid product details.", 400);
        }

        const previousImages = product.images || [];
        Object.assign(product, {
            name: name.trim(), category: category.trim(), subcategory: subcategory.trim(),
            description: description.trim(), price: parsedPrice, sizes: parsedSizes,
            bestseller: bestseller === "true" || bestseller === true,
        });
        if (uploadedFiles.length > 0) product.images = uploadedFiles.map((file) => file.filename);
        await product.save();
        if (uploadedFiles.length > 0) {
            await Promise.all(previousImages.map((image) => fs.unlink(path.join(UPLOADS_DIR, image)).catch(() => {})));
        }
        return sendSuccess(res, { message: "Product updated successfully.", product });
    } catch (error) {
        console.error("Product update failed:", error);
        await deleteUploadedFiles(uploadedFiles);
        return sendError(res, "Unable to update product.");
    }
};