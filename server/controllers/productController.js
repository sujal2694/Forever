import { productModel } from "../models/productModel.js";
import fs from 'fs';



export const addProduct = async (req, res) => {
    try {
        let image_filename = `${req.file.filename}`;

        const product = new productModel({
            id: req.body.id,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            subCategoty: req.body.subCategoty,
            image: image_filename
        })

        await product.save();
        res.json({ success: true, message: "Product added successfully", product });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const listProduct = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({ success: true, data: products })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error to fetch product list" })
    }
}

export const removeProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.body.id);
        fs.unlink(`uploads/${product.image}`, () => { });
        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Do not remove this product." })
    }
}