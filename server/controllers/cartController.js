import { userModel } from "../models/userModel.js";

export const addToCart = async (req, res) => {
    try {
        const userId = req.body.userId;
        const itemId = req.body.itemId || req.body.itemid;

        if (!userId || !itemId) {
            return res.json({ success: false, message: "Invalid cart request" });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        const cartData = userData.cartData || {};
        cartData[itemId] = (cartData[itemId] || 0) + 1;

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Item added to cart successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding to cart" });
    }
};

export const removeFromcart = async (req, res) => {
    try {
        const userId = req.body.userId;
        const itemId = req.body.itemId || req.body.itemid;

        if (!userId || !itemId) {
            return res.json({ success: false, message: "Invalid cart request" });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        const cartData = userData.cartData || {};
        if (cartData[itemId] > 0) {
            cartData[itemId] -= 1;
            if (cartData[itemId] === 0) {
                delete cartData[itemId];
            }
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Removed From cart" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = req.body.userId;
        if (!userId) {
            return res.json({ success: false, message: "User not found" });
        }

        const userData = await userModel.findById(userId);
        const cartData = userData?.cartData || {};
        res.json({ success: true, cartData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};