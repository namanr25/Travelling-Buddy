const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    title: String,
    locationsToVisit: String,
    photos: [String],
    description: String,
    perks: [String],
    extraInfo: String,
    priceToOutput: {
        economy: Number,
        medium: Number,
        luxury: Number
    },
    basePrice: Number // Always set to economy price
});

const Place = mongoose.model('Place', placeSchema);
module.exports = Place;