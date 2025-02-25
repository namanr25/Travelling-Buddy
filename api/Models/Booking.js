const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    checkIn: { type: Date, required: true },
    priceSelectedByUser: Number
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;