const mongoose = require('mongoose');
const { Schema } = mongoose;

// one user has many bookings at different days
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true }, // userID
    
    password: { type: String, required: true },
    addressLine1: { type: String },
    addressLine2: { type: String },
    addressLine3: { type: String },
    profession: { type: String },
    age: { type: Number, min: 18 },
    socialMediaID: { type: String },
    phone: { type: String, unique: true },
    personalityCategory: { type: Number },
    bookingIds: [{ type: String }]
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;