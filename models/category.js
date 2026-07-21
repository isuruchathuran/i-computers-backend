import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    image: {
        type: String,
        default: "/images/default-category.png"
    }
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);

export default Category;
