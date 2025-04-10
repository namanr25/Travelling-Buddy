const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    reviewText: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;