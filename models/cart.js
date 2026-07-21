import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    items: [
        {
            productId: {
                type: String,
                required: true
            },
            qty: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ]
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
