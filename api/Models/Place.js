const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
    day: Number,
    activity: String
});

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
    basePrice: Number,
    itinerary: {
        economy: { type: [itinerarySchema], default: [{ day: 1, activity: '' }, { day: 2, activity: '' }, { day: 3, activity: '' }] },
        medium: { type: [itinerarySchema], default: [{ day: 1, activity: '' }, { day: 2, activity: '' }, { day: 3, activity: '' }, { day: 4, activity: '' }] },
        luxury: { type: [itinerarySchema], default: [{ day: 1, activity: '' }, { day: 2, activity: '' }, { day: 3, activity: '' }, { day: 4, activity: '' }, { day: 5, activity: '' }] }
    }
});

const Place = mongoose.model('Place', placeSchema);
module.exports = Place;