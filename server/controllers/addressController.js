import { addressModel } from "../models/addressModel.js";

export const addAddress = async (req, res) => {
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
        const newAddress = new addressModel({
            name: name,
            number: number,
            landmark: landmark,
            address: address,
            city: city,
            state: state,
            pincode: pincode
        });

        const savedAddress = await newAddress.save();
        res.status(201).json({ success: true, data: savedAddress });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const listAddresses = async (req, res) => {
    try {
        const addresses = await addressModel.find();
        res.status(200).json({ success: true, data: addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const editAddress = async (req, res) => {
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
        const updatedAddress = await addressModel.findByIdAndUpdate(
            id,
            {
                name: name,
                number: number,
                landmark: landmark,
                address: address,
                city: city,
                state: state,
                pincode: pincode
            },
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
    const { id } = req.params;

    try {
        const deletedAddress = await addressModel.findByIdAndDelete(id);

        if (!deletedAddress) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        res.status(200).json({ success: true, message: "Address deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};