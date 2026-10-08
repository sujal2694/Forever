import jwt from 'jsonwebtoken';
import { userModel } from '../models/userModel.js';
import { sendError } from '../utils/response.js';

export const authMiddleware = async (req, res, next) => {
    const token = req.headers.token;

    if (!token) {
        return sendError(res, "Not authorized. Login again.", 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        const user = await userModel.findById(decoded.id).select('-password');

        if (!user) {
            return sendError(res, "Not authorized. Login again.", 401);
        }

        req.userId = user._id; // match what cartController expects
        req.user = user;       // keep this too, in case other code uses it
        next();
    } catch (error) {
        return sendError(res, "Not authorized. Login again.", 401);
    }
};