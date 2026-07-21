import Product from "../models/product.js"; 
import { isAdmin } from "./userController.js";

//createProduct
export async function createProduct (req, res){

    if(! isAdmin(req) ){
        res.status(403).json({
            message : "Access denied. Your account does not have the necessary permissions."
        });
        return;
    }

    try {
        // Auto-generate Product Code (PRD-XXXX)
        const lastProduct = await Product.findOne({ productCode: { $exists: true, $ne: null } }).sort({ createdAt: -1 });
        let nextNumber = 1;
        if (lastProduct && lastProduct.productCode) {
            const numericPart = parseInt(lastProduct.productCode.replace("PRD-", ""));
            if (!isNaN(numericPart)) {
                nextNumber = numericPart + 1;
            }
        }
        const productCode = "PRD-" + nextNumber.toString().padStart(4, "0");

        const data = {};
        
        // Keep internal productId unique (using random string)
        data.productId = "ID-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
        data.productCode = productCode;

        if(req.body.name == null){
            res.status(400).json({message : "Product name is required"});
            return;
        }

        data.name = req.body.name;
        data.description = req.body.description || "";
        data.altNames = req.body.altNames || [];

        if(req.body.price == null){
            res.status(400).json({message : "Product price is required"});
            return;
        }

        data.price = req.body.price;
        data.labeledPrice = req.body.labeledPrice || req.body.price;
        data.category = req.body.category || "Others";

        
        data.images = req.body.images || [
            "/images/default-product-1.png",
            "/images/default-product-2.png"
        ];

        
        data.isVisible = typeof req.body.isVisible === "boolean" ? req.body.isVisible : true;

        data.model = req.body.model || "Standard";
        data.brand = req.body.brand || "Generic";
        data.qty = req.body.qty != null ? req.body.qty : 100;
        data.specifications = req.body.specifications || [];

        const newProduct = new Product(data);
        await newProduct.save();

        res.status(201).json({
            message : "Product created successfully", Product : newProduct       
        });

    } catch (error) {
        res.status(500).json({
            message : "Error Creating product", error: error.message
        });
    }
}


//getProduct
export async function getProducts(req, res) {
    console.log("Get products by id api called")
    try {
        if(isAdmin(req)){
            const products = await Product.find();
            res.status(200).json(products);
        } else {
            const products = await Product.find({ isVisible : true });
            res.status(200).json(products);
        }
    } catch (error) {
        res.status(500).json({
            message : "Error fetching products", error: error.message
        });
    }
}

export async function deletePrpduct(req, res){
    if(!isAdmin(req)){
        res.status(403).json({
            message : "Access denied. Admins only."
        });
        return;
    }
    
    try {
        const productId = req.params.productId;
        await Product.deleteOne({ productId: productId });
        res.status(200).json({
            message : "Product deleted Successfully."
        });
    } catch (error) {
        res.status(500).json({
            message : "Error deleting product.", error: error.message            
        });
    }
}

//updateProduct
export async function updateProduct(req, res) {
    if(! isAdmin(req) ){
        res.status(403).json({
            message : "Access denied. Your account does not have the necessary permissions."
        });
        return;
    }

    try {
        const productId = req.params.productId;

        const data = {};

        if(req.body.name == null){
            res.status(400).json({message : "Product name is required"});
            return;
        }

        data.name = req.body.name;
        data.description = req.body.description || "";
        data.altNames = req.body.altNames || [];

        if(req.body.price == null){
            res.status(400).json({message : "Product price is required"});
            return;
        }

        data.price = req.body.price;
        data.labeledPrice = req.body.labeledPrice || req.body.price;
        data.category = req.body.category || "Others";

        
        data.images = req.body.images || [
            "/images/default-product-1.png",
            "/images/default-product-2.png"
        ];

        
        data.isVisible = typeof req.body.isVisible === "boolean" ? req.body.isVisible : true;

        data.model = req.body.model || "Standard";
        data.brand = req.body.brand || "Generic";
        data.qty = req.body.qty != null ? req.body.qty : 100;
        data.specifications = req.body.specifications || [];

        await Product.updateOne({ productId: productId }, data);

        res.status(201).json({
            message : "Product updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            message : "Error updating product...", error: error.message
        });
    }
}

export async function getProductById(req, res){
    try {
        const productId = req.params.productId;
        const product = await Product.findOne({productId: productId});

        if(product == null){
            res.status(404).json({
                message : "Product not found."
            });
            return;
        }

        if(! product.isVisible){
            if(!isAdmin(req)){
                res.status(404).json({
                    message : "Product not found."
                });
                return;
            }
        }
        res.status(200).json(product);


    } catch (error) {
        res.status(500).json({
            message : "Error fetching product." , error : error.message
        });
    }
}

export async function searchProducts(req, res){
    try {
        const query = req.query.q || "";
        const regex = new RegExp(query, "i");
        
        let filter = {
            $or: [
                { productCode: regex },
                { name: regex },
                { altNames: regex },
                { category: regex },
                { brand: regex },
                { description: regex }
            ]
        };

        if (!isAdmin(req)) {
            filter.isVisible = true;
        }

        const products = await Product.find(filter);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error searching products", error: error.message });
    }
}