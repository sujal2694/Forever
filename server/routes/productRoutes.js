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
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed."), false);
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
    removeProduct
);

productRouter.post("/update-product", upload.array("images", 5), updateProduct);
