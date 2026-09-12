import jwt from 'jsonwebtoken'
import { userModel } from '../models/userModel.js';
import validator from 'validator'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose';
import { sendError, sendSuccess } from '../utils/response.js';

export const registerUser = async (req, res) => {
    const { email, password, name, number } = req.body;
    try {

        if (typeof email !== 'string') {
            return sendError(res, "Email is incorrect.", 400)
        }

        const exists = await userModel.findOne({ email: { $eq: email } });
        if (exists) {
            return sendError(res, "User already exists.", 409)
        }

        //validating email
        if (!validator.isEmail(email)) {
            return sendError(res, "Email is incorrect.", 400)
        }

        if (password.length < 8) {
            return sendError(res, 'Password is weak, make it at least 8 characters.', 400)
        }

        //number validation
        if (!validator.isMobilePhone(number, 'en-IN')) {
            return sendError(res, "Phone number is invalid.", 400)
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
        sendSuccess(res, { token })



    } catch (error) {
        sendError(res, "Unable to register user")
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
            return sendError(res, "Invalid credentials", 401)
        }

        const user = await userModel.findOne({ email: { $eq: email } })

        if (!user) {
            return sendError(res, "Invalid credentials", 401)
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return sendError(res, "Invalid credentials", 401)
        }

        const token = createToken(user._id);
        sendSuccess(res, { token })

    } catch (error) {
        console.log(error);
        sendError(res, "Unable to log in")
    }
}

// Returns the CURRENTLY LOGGED-IN user's own profile.
// Relies on authMiddleware having set req.userId (or req.user._id) from the token.
// This is what /profile should call — not getUsers.
export const getProfile = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;

        if (!userId) {
            return sendError(res, "Not authorized. Login again.", 401);
        }

        const user = await userModel.findById(userId).select('-password');

        if (!user) {
            return sendError(res, "Not authorized. Login again.", 401);
        }

        sendSuccess(res, { user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        sendError(res, "Unable to fetch profile.");
    }
}

export const getUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select('-password');
        sendSuccess(res, { users });
    } catch (error) {
        sendError(res, error.message);
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, "Invalid user id.", 400);
        }

        const user = await userModel.findById(id).select('-password');

        if (!user) {
            return sendError(res, "User not found.", 404);
        }

        sendSuccess(res, { user });

    } catch (error) {
        console.error("Error fetching user by id:", error);
        sendError(res, "Unable to fetch user.");
    }
}