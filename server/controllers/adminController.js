import jwt from 'jsonwebtoken'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import { adminModel } from '../models/adminModel.js';

export const registerAdmin = async (req, res) => {
    const { email, password, orgname, ownname, number } = req.body;
    try {

        if (typeof email !== 'string' || !validator.isEmail(email)) {
            return res.json({ success: false, message: "Email is incorrect." })
        }

        if (typeof orgname !== 'string' || orgname.trim().length === 0) {
            return res.json({ success: false, message: "Organization name is required." })
        }

        if (typeof ownname !== 'string' || ownname.trim().length === 0) {
            return res.json({ success: false, message: "Owner name is required." })
        }

        if (typeof password !== 'string' || password.length < 8) {
            return res.json({ success: false, message: 'Password is weak. Make it strong & use atleast 8 characters.' })
        }

        if (!validator.isMobilePhone(number, 'en-IN')) {
            return res.json({ success: false, message: "Phone number is invalid." })
        }

        const normalizedEmail = validator.normalizeEmail(email) || email;

        const exists = await adminModel.findOne({ email: { $eq: normalizedEmail } });
        if (exists) {
            return res.json({ success: false, message: "User already exists." })
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
        res.json({ success: true, token, message: "Registration successful" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "error" })
    }
}

const createToken = (id) => {
    return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const normalizedEmail = validator.normalizeEmail(email) || email;
        const admin = await adminModel.findOne({ email: { $eq: normalizedEmail } })

        if (!admin) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, admin.password)

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const token = createToken(admin._id)
        res.json({ success: true, token, message: "Login successful" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}