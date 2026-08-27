import mongoose from "mongoose";
import { addressModel } from "../models/addressModel.js";
import { userModel } from "../models/userModel.js";

// All routes using these controllers must run behind auth middleware
// that sets req.userId from the verified token. userId is NEVER read
// from req.body — a client could otherwise spoof another user's id.

export const addAddress = async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { name, number, landmark, address, city, state, pincode } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 50) {
        return res.status(400).json({ success: false, message: "Invalid name" });
    }

    const numberStr = String(number).trim();
    if (!/^[1-9][0-9]{9}$/.test(numberStr)) {
        return res.status(400).json({ success: false, message: "Invalid number" });
    }

    if (typeof address !== 'string' || address.trim().length < 5 || address.length > 200) {
        return res.status(400).json({ success: false, message: "Invalid address" });
    }

    if (typeof city !== 'string' || !/^[A-Za-z\s]{2,30}$/.test(city.trim())) {
        return res.status(400).json({ success: false, message: "Invalid city" });
    }

    if (typeof state !== 'string' || !/^[A-Za-z\s]{2,30}$/.test(state.trim())) {
        return res.status(400).json({ success: false, message: "Invalid state" });
    }

    const pincodeStr = String(pincode).trim();
    if (!/^[1-9][0-9]{5}$/.test(pincodeStr)) {
        return res.status(400).json({ success: false, message: "Invalid pincode" });
    }

    try {
        const newAddress = new addressModel({
            userId, name, number, landmark, address, city, state, pincode
        });
        const savedAddress = await newAddress.save();
        res.status(201).json({ success: true, data: savedAddress });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const listAddresses = async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const addresses = await addressModel.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const editAddress = async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const { name, number, landmark, address, city, state, pincode } = req.body;

    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 50) {
        return res.status(400).json({ success: false, message: "Invalid name" });
    }

    const numberStr = String(number).trim();
    if (!/^[1-9][0-9]{9}$/.test(numberStr)) {
        return res.status(400).json({ success: false, message: "Invalid number" });
    }

    if (typeof address !== 'string' || address.trim().length < 5 || address.length > 200) {
        return res.status(400).json({ success: false, message: "Invalid address" });
    }

    if (typeof city !== 'string' || !/^[A-Za-z\s]{2,30}$/.test(city.trim())) {
        return res.status(400).json({ success: false, message: "Invalid city" });
    }

    if (typeof state !== 'string' || !/^[A-Za-z\s]{2,30}$/.test(state.trim())) {
        return res.status(400).json({ success: false, message: "Invalid state" });
    }

    const pincodeStr = String(pincode).trim();
    if (!/^[1-9][0-9]{5}$/.test(pincodeStr)) {
        return res.status(400).json({ success: false, message: "Invalid pincode" });
    }

    try {
        // { _id: id, userId } ensures a user can only ever edit their own address
        const updatedAddress = await addressModel.findOneAndUpdate(
            { _id: id, userId },
            { name, number, landmark, address, city, state, pincode },
            { new: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        res.status(200).json({ success: true, data: updatedAddress });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteAddress = async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;

    try {
        // { _id: id, userId } ensures a user can only ever delete their own address
        const deletedAddress = await addressModel.findOneAndDelete({ _id: id, userId });

        if (!deletedAddress) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        res.status(200).json({ success: true, message: "Address deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getAllAddresses = async (req, res) => {
    try {
        const addresses = await addressModel.find({});
        res.json({ success: true, addresses })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Unable to fetch addresses." })
    }
}