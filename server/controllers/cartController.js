import { userModel } from "../models/userModel.js";
import { productModel } from "../models/productModel.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { isSafeProductId } from "../utils/productId.js";

const MAX_DISTINCT_LINES = 30;
const MAX_QTY_PER_LINE = 10;

const parseCartRequest = (body) => {
    const itemId = String(body.itemId || body.itemid || "").trim();
    const rawSize = typeof body.size === "object" ? body.size?.size : body.size;
    const size = String(rawSize || "").trim().toUpperCase();
    return { itemId, size };
};

export const isValidCartRequest = (userId, itemId, size) =>
    Boolean(userId) &&
    isSafeProductId(itemId) &&
    /^[A-Z0-9-]{1,10}$/.test(size);

export const addToCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { itemId, size } = parseCartRequest(req.body);

        if (!isValidCartRequest(userId, itemId, size)) {
            return sendError(res, "Invalid cart request", 400);
        }

        const [user, product] = await Promise.all([
            userModel.findById(userId).select("cartData").lean(),
            productModel.findById(itemId).select("sizes").lean(),
        ]);
        if (!user) return sendError(res, "User not found", 404);
        if (!product) return sendError(res, "Product not found", 404);

        const sizeRecord = product.sizes?.find(
            (entry) =>
                String(typeof entry === "string" ? entry : entry?.size || "").trim().toUpperCase() === size
        );
        if (!sizeRecord) {
            return sendError(res, "Selected size is not available for this product", 400);
        }

        const cart = user.cartData || {};
        const currentQty = Number(cart[itemId]?.[size]) || 0;
        const stock = Number(sizeRecord.stock) || 0;

        if (currentQty >= stock) {
            return sendError(res, "This size is out of stock.", 409);
        }
        if (currentQty >= MAX_QTY_PER_LINE) {
            return sendError(res, `You can add at most ${MAX_QTY_PER_LINE} of one item.`, 409);
        }

        if (currentQty === 0) {
            const lines = Object.values(cart).reduce(
                (count, sizes) => count + Object.keys(sizes || {}).length,
                0
            );
            if (lines >= MAX_DISTINCT_LINES) {
                return sendError(
                    res,
                    `Your cart can hold at most ${MAX_DISTINCT_LINES} different items.`,
                    409
                );
            }
        }

        // Atomic increment: only applies if the quantity is still below the limit,
        // so two quick requests can't overwrite each other or exceed the cap.
        const limit = Math.min(stock, MAX_QTY_PER_LINE);
        const path = `cartData.${itemId}.${size}`;
        const result = await userModel.updateOne(
            { _id: userId, [path]: { $not: { $gte: limit } } },
            { $inc: { [path]: 1 } }
        );
        if (result.modifiedCount !== 1) {
            return sendError(res, "Quantity limit reached for this item.", 409);
        }

        return sendSuccess(res, { message: "Item added to cart successfully" });
    } catch (error) {
        console.error("addToCart failed:", error);
        return sendError(res, "Error adding to cart", 500);
    }
};

export const removeFromcart = async (req, res) => {
    try {
        const userId = req.userId;
        const { itemId, size } = parseCartRequest(req.body);

        if (!isValidCartRequest(userId, itemId, size)) {
            return sendError(res, "Invalid cart request", 400);
        }

        const path = `cartData.${itemId}.${size}`;
        // 1) decrement only if > 0, 2) drop the size when it hits 0, 3) drop empty product
        await userModel.updateOne({ _id: userId, [path]: { $gt: 0 } }, { $inc: { [path]: -1 } });
        await userModel.updateOne({ _id: userId, [path]: 0 }, { $unset: { [path]: "" } });
        await userModel.updateOne(
            { _id: userId, [`cartData.${itemId}`]: {} },
            { $unset: { [`cartData.${itemId}`]: "" } }
        );

        return sendSuccess(res, { message: "Removed from cart" });
    } catch (error) {
        console.error("removeFromcart failed:", error);
        return sendError(res, "Error removing from cart", 500);
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return sendError(res, "User not found", 401);

        const user = await userModel.findById(userId).select("cartData").lean();
        return sendSuccess(res, { cartData: user?.cartData || {} });
    } catch (error) {
        console.error("getCart failed:", error);
        return sendError(res, "Error fetching cart", 500);
    }
};