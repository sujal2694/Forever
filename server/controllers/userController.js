import jwt from 'jsonwebtoken'
import { userModel } from '../models/userModel.js';
import validator from 'validator'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose';

export const registerUser = async (req, res) => {
    const { email, password, name, number } = req.body;
    try {

        if (typeof email !== 'string') {
            return res.json({ success: false, message: "Email is incorrect." })
        }

        const exists = await userModel.findOne({ email: { $eq: email } });
        if (exists) {
            return res.json({ success: false, message: "User already exists." })
        }

        //validating email
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Email is incorrect." })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: 'Paaword is weak, Make strong & use atleast 8 charachters.' })
        }

        //number validation
        if (!validator.isMobilePhone(number, 'en-IN')) {
            return res.json({ success: false, message: "Phone number is invalid." })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: name,
            number: number,
            email: email,
            password: hashedPassword
        })

        const user = await newUser.save();
        const token = createToken(user._id)
        res.json({ success: true, token })



    } catch (error) {
        res.json({ success: false, message: "error" })
        console.log(error);
    }
}

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (typeof email !== 'string') {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const user = await userModel.findOne({ email: { $eq: email } })

        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const token = createToken(user._id);
        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Returns the CURRENTLY LOGGED-IN user's own profile.
// Relies on authMiddleware having set req.userId (or req.user._id) from the token.
// This is what /profile should call — not getUsers.
export const getProfile = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Not authorized. Login again." });
        }

        const user = await userModel.findById(userId).select('-password');

        if (!user) {
            return res.status(401).json({ success: false, message: "Not authorized. Login again." });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ success: false, message: "Unable to fetch profile." });
    }
}

export const getUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select('-password');
        res.json({ success: true, users});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({ success: false, message: "Invalid user id." });
        }

        const user = await userModel.findById(id).select('-password');

        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }

        res.json({ success: true, user });

    } catch (error) {
        console.error("Error fetching user by id:", error);
        res.json({ success: false, message: "Unable to fetch user." });
    }
}