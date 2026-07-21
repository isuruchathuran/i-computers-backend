import Review from "../models/review.js";

export async function createReview(req, res) {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    try {
        const review = new Review({
            ...req.body,
            userId: req.user.email,
            name: `${req.user.firstName} ${req.user.lastName}`
        });
        await review.save();
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: "Error creating review", error: error.message });
    }
}

export async function getProductReviews(req, res) {
    try {
        const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews", error: error.message });
    }
}
