import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.js";

dotenv.config();

async function migrateProducts() {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to database successfully.");

        // Find products without a productCode or where it's null
        const products = await Product.find({ 
            $or: [
                { productCode: { $exists: false } },
                { productCode: null }
            ]
        }).sort({ createdAt: 1 });
        
        console.log(`Found ${products.length} products to migrate.`);
        
        let counter = 1;
        for (const product of products) {
            // Find the highest existing productCode to ensure we don't duplicate
            const lastProduct = await Product.findOne({ productCode: { $exists: true, $ne: null } }).sort({ productCode: -1 });
            if (lastProduct && lastProduct.productCode) {
                const numericPart = parseInt(lastProduct.productCode.replace("PRD-", ""));
                if (!isNaN(numericPart) && numericPart >= counter) {
                    counter = numericPart + 1;
                }
            }
            
            const productCode = "PRD-" + counter.toString().padStart(4, "0");
            
            await Product.updateOne(
                { _id: product._id },
                { $set: { productCode: productCode } }
            );
            
            console.log(`Updated product '${product.name}' with code: ${productCode}`);
            counter++;
        }
        
        console.log("Migration complete.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrateProducts();
