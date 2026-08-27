import jwt from 'jsonwebtoken';
import { userModel } from '../models/userModel.js';

export const authMiddleware = async (req, res, next) => {
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized. Login again." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ success: false, message: "Not authorized. Login again." });
        }

        req.userId = user._id; // match what cartController expects
        req.user = user;       // keep this too, in case other code uses it
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Not authorized. Login again." });
    }
};