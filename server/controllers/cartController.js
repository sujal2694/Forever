import { userModel } from "../models/userModel.js";
import { productModel } from "../models/productModel.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const addToCart = async (req, res) => {
    try {
        const userId = req.userId;
        const itemId = req.body.itemId || req.body.itemid;
        const size = req.body.size;

        if (!userId || !itemId || !size) {
            return sendError(res, "Invalid cart request", 400);
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return sendError(res, "User not found", 404);
        }

        const product = await productModel.findById(itemId);
        const requestedSize = typeof size === "object" ? size?.size : size;
        const normalizedSize = String(requestedSize || "").trim().toUpperCase();
        if (!normalizedSize) {
            return sendError(res, "A product size is required", 400);
        }
        if (!product) {
            return sendError(res, "Product not found", 404);
        }

        const sizeRecord = product?.sizes?.find((entry) => String(typeof entry === "string" ? entry : entry?.size || "").trim().toUpperCase() === normalizedSize);
        if (!sizeRecord) {
            return sendError(res, "Selected size is not available for this product", 400);
        }

        const savedSizes = userData.cartData?.[itemId] || {};
        const savedSizeKey = Object.keys(savedSizes).find((key) => key.toUpperCase() === normalizedSize);
        const currentQuantity = savedSizeKey ? Number(savedSizes[savedSizeKey]) || 0 : 0;
        if (currentQuantity >= Number(sizeRecord.stock || 0)) {
            return sendError(res, "This size is out of stock.", 409);
        }

        const cartData = userData.cartData || {};

        if (!cartData[itemId]) {
            cartData[itemId] = {};
        }
        if (savedSizeKey && savedSizeKey !== normalizedSize) {
            delete cartData[itemId][savedSizeKey];
        }
        cartData[itemId][normalizedSize] = currentQuantity + 1;

        await userModel.findByIdAndUpdate(userId, { cartData });
        sendSuccess(res, { message: "Item added to cart successfully" });
    } catch (error) {
        console.log(error);
        sendError(res, "Error adding to cart");
    }
};

export const removeFromcart = async (req, res) => {
    try {
        const userId = req.userId;
        const itemId = req.body.itemId || req.body.itemid;
        const size = req.body.size;

        if (!userId || !itemId || !size) {
            return sendError(res, "Invalid cart request", 400);
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return sendError(res, "User not found", 404);
        }

        const cartData = userData.cartData || {};
        const normalizedSize = String(size).toUpperCase();
        const itemSizes = cartData[itemId];
        if (itemSizes?.[normalizedSize] > 0) {
            itemSizes[normalizedSize] -= 1;
            if (itemSizes[normalizedSize] === 0) {
                delete itemSizes[normalizedSize];
            }
            if (Object.keys(itemSizes).length === 0) {
                delete cartData[itemId];
            }
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        sendSuccess(res, { message: "Removed From cart" });
    } catch (error) {
        console.log(error);
        sendError(res, "Error");
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return sendError(res, "User not found", 401);
        }

        const userData = await userModel.findById(userId);
        const cartData = userData?.cartData || {};
        sendSuccess(res, { cartData });
    } catch (error) {
        console.log(error);
        sendError(res, "Error");
    }
};