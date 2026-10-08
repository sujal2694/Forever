import jwt from 'jsonwebtoken';
import { adminModel } from '../models/adminModel.js'
import { sendError } from '../utils/response.js';

export const adminAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(res, "Not authorized. Login again.", 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        const admin = await adminModel.findById(decoded.id).select('-password');

        if (!admin) {
            return sendError(res, "Not authorized. Login again.", 401);
        }

        req.user = admin; // { _id, name, email, role, ... }
        next();
    } catch (error) {
        return sendError(res, "Not authorized. Login again.", 401);
    }
};


