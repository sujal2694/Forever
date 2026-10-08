import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import {
    addProduct,
    getProduct,
    listProduct,
    removeProduct,
    updateProduct,
} from "../controllers/productController.js";
import { adminAuthMiddleware } from "../middleware/adminMiddleware.js";

export const productRouter = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;

        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
        "image/avif": [".avif"],
    };
    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions[file.mimetype]?.includes(extension)) {
        cb(null, true);
    } else {
        const error = new Error("Only JPEG, PNG, WebP, and AVIF images are allowed.");
        error.status = 400;
        cb(error, false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        files: 5,
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

productRouter.post(
    "/add-product",
    adminAuthMiddleware,
    upload.array("images", 5),
    addProduct
);

productRouter.get(
    "/list-product",
    listProduct
);

productRouter.get(
    "/:id",
    getProduct
);

productRouter.post(
    "/remove-product",
    adminAuthMiddleware,
    removeProduct
);

productRouter.post("/update-product", adminAuthMiddleware, upload.array("images", 5), updateProduct);
