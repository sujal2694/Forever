import e from "express";
import multer from 'multer'
import { addProduct, listProduct, removeProduct } from "../controllers/productController.js";

export const productRouter = e.Router();

//image storage engine

const storage = multer.diskStorage({
    destination:"uploads",
    filename:(req,file,cb)=>{
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({storage:storage})

productRouter.post("/add-product",upload.single("image"),addProduct);
productRouter.get("/list-product", listProduct);
productRouter.post("/remove-product", removeProduct);