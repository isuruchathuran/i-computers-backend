import express from "express"; 
import { createProduct, deletePrpduct, getProductById, getProducts, updateProduct } from "../controllers/productController.js";

const productRouter = express.Router();
//localhost:3000/products/trending
productRouter.post("/", createProduct);
productRouter.get("/", getProducts);


productRouter.get("/trending", (req,res)=>{
    res.status(200).json({
        message : "This is trending products endpoint."
    })
})

productRouter.delete("/:productId", deletePrpduct);
productRouter.put("/:productId", updateProduct);
productRouter.get("/:productId", getProductById);



export default productRouter;
