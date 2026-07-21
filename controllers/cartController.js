import Cart from "../models/cart.js";

export async function getCart(req, res) {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    try {
        let cart = await Cart.findOne({ userId: req.user.email });
        if (!cart) cart = await Cart.create({ userId: req.user.email, items: [] });
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error fetching cart", error: error.message });
    }
}

export async function updateCart(req, res) {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    try {
        const cart = await Cart.findOneAndUpdate(
            { userId: req.user.email },
            { items: req.body.items },
            { new: true, upsert: true }
        );
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error updating cart", error: error.message });
    }
}
