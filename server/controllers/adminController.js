import jwt from 'jsonwebtoken'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import { adminModel } from '../models/adminModel.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const registerAdmin = async (req, res) => {
    const { email, password, orgname, ownname, number } = req.body;
    try {
        if (typeof email !== 'string' || !validator.isEmail(email)) {
            return sendError(res, "Email is incorrect.", 400)
        }

        if (typeof orgname !== 'string' || orgname.trim().length === 0) {
            return sendError(res, "Organization name is required.", 400)
        }

        if (typeof ownname !== 'string' || ownname.trim().length === 0) {
            return sendError(res, "Owner name is required.", 400)
        }

        if (typeof password !== 'string' || password.length < 8) {
            return sendError(res, 'Password is weak. Make it strong & use atleast 8 characters.', 400)
        }

        if (!validator.isMobilePhone(number, 'en-IN')) {
            return sendError(res, "Phone number is invalid.", 400)
        }

        const normalizedEmail = validator.normalizeEmail(email) || email;

        const exists = await adminModel.findOne({ email: { $eq: normalizedEmail } });
        if (exists) {
            return sendError(res, "User already exists.", 409)
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new adminModel({
            orgname: orgname.trim(),
            ownname: ownname.trim(),
            number,
            email: normalizedEmail,
            password: hashedPassword
        })

        const admin = await newAdmin.save();
        const token = createToken(admin._id)
        sendSuccess(res, { token, message: "Registration successful" })

    } catch (error) {
        console.error("Admin registration failed:", error);
        sendError(res, "Unable to register admin.");
    }
}

const createToken = (id) => {
    return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (typeof email !== 'string' || typeof password !== 'string') {
            return sendError(res, "Invalid credentials", 401)
        }

        const normalizedEmail = validator.normalizeEmail(email) || email;
        const admin = await adminModel.findOne({ email: { $eq: normalizedEmail } })

        if (!admin) {
            return sendError(res, "Invalid credentials", 401)
        }

        const isMatch = await bcrypt.compare(password, admin.password)

        if (!isMatch) {
            return sendError(res, "Invalid credentials", 401)
        }

        const token = createToken(admin._id)
        sendSuccess(res, { token, message: "Login successful" })

    } catch (error) {
        console.error("Admin login failed:", error);
        sendError(res, "Unable to log in.");
    }
}

export const getAdminDetails = async (req, res) => {
    try {
        const adminId = req.user?._id || req.adminId;
        const admin = await adminModel.findById(adminId).select('-password');
        if (!admin) {
            return sendError(res, "Admin not found", 404);
        }
        sendSuccess(res, { admin });
    } catch (error) {
        console.error("Admin profile lookup failed:", error);
        sendError(res, "Unable to fetch admin details.");
    }
}