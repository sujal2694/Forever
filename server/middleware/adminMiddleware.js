import jwt from 'jsonwebtoken';
import { adminModel } from '../models/adminModel.js'

export const adminAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "Not authorized. Login again." });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await adminModel.findById(decoded.id).select('-password');

        if (!admin) {
            return res.status(401).json({ success: false, message: "Not authorized. Login again." });
        }

        req.user = admin; // { _id, name, email, role, ... }
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Not authorized. Login again." });
    }
};


