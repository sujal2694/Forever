import mongoose from "mongoose";
import { addressModel } from "../models/addressModel.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { userModel } from "../models/userModel.js";

// All routes using these controllers must run behind auth middleware
// that sets req.userId from the verified token. userId is NEVER read
// from req.body — a client could otherwise spoof another user's id.

export const addAddress = async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return sendError(res, "Unauthorized", 401);
    }

    const { name, number, landmark, address, city, state, pincode } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }

    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 50) {
        return sendError(res, "Invalid name", 400);
    }

    const numberStr = String(number).trim();
    if (!/^[1-9][0-9]{9}$/.test(numberStr)) {
        return sendError(res, "Invalid number", 400);
    }

    if (typeof address !== 'string' || address.trim().length < 5 || address.length > 200) {
        return sendError(res, "Invalid address", 400);
    }

    if (typeof city !== 'string' || !/^[A-Za-z\s]{2,30}$/.test(city.trim())) {
        return sendError(res, "Invalid city", 400);
    }

    if (typeof state !== 'string' || !/^[A-Za-z\s]{2,30}$/.test(state.trim())) {
        return sendError(res, "Invalid state", 400);
    }

    const pincodeStr = String(pincode).trim();
    if (!/^[1-9][0-9]{5}$/.test(pincodeStr)) {
        return sendError(res, "Invalid pincode", 400);
    }

    try {
        const newAddress = new addressModel({
            userId, name, number, landmark, address, city, state, pincode
        });
        const savedAddress = await newAddress.save();
        sendSuccess(res, { data: savedAddress }, 201);
    } catch (error) {
        console.error("Address creation failed:", error);
        sendError(res, "Unable to save address.");
    }
};

export const listAddresses = async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return sendError(res, "Unauthorized", 401);
    }

    try {
        const addresses = await addressModel.find({ userId }).sort({ createdAt: -1 });
        sendSuccess(res, { data: addresses });
    } catch (error) {
        console.error("Address listing failed:", error);
        sendError(res, "Unable to fetch addresses.");
    }
};

export const editAddress = async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return sendError(res, "Unauthorized", 401);
    }

    const { id } = req.params;
    const { name, number, landmark, address, city, state, pincode } = req.body;

    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 50) {
        return sendError(res, "Invalid name", 400);
    }

    const numberStr = String(number).trim();
    if (!/^[1-9][0-9]{9}$/.test(numberStr)) {
        return sendError(res, "Invalid number", 400);
    }

    if (typeof address !== 'string' || address.trim().length < 5 || address.length > 200) {
        return sendError(res, "Invalid address", 400);
    }

    if (typeof city !== 'string' || !/^[A-Za-z\s]{2,30}$/.test(city.trim())) {
        return sendError(res, "Invalid city", 400);
    }

    if (typeof state !== 'string' || !/^[A-Za-z\s]{2,30}$/.test(state.trim())) {
        return sendError(res, "Invalid state", 400);
    }

    const pincodeStr = String(pincode).trim();
    if (!/^[1-9][0-9]{5}$/.test(pincodeStr)) {
        return sendError(res, "Invalid pincode", 400);
    }

    try {
        // { _id: id, userId } ensures a user can only ever edit their own address
        const updatedAddress = await addressModel.findOneAndUpdate(
            { _id: id, userId },
            { name, number, landmark, address, city, state, pincode },
            { new: true }
        );

        if (!updatedAddress) {
            return sendError(res, "Address not found", 404);
        }

        sendSuccess(res, { data: updatedAddress });
    } catch (error) {
        console.error("Address update failed:", error);
        sendError(res, "Unable to update address.");
    }
};

export const deleteAddress = async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return sendError(res, "Unauthorized", 401);
    }

    const { id } = req.params;

    try {
        // { _id: id, userId } ensures a user can only ever delete their own address
        const deletedAddress = await addressModel.findOneAndDelete({ _id: id, userId });

        if (!deletedAddress) {
            return sendError(res, "Address not found", 404);
        }

        sendSuccess(res, { message: "Address deleted successfully" });
    } catch (error) {
        console.error("Address deletion failed:", error);
        sendError(res, "Unable to delete address.");
    }
};

export const getAllAddresses = async (req, res) => {
    try {
        const addresses = await addressModel.find({});
        sendSuccess(res, { addresses })
    } catch (error) {
        console.log(error);
        sendError(res, "Unable to fetch addresses.")
    }
}