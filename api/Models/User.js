const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    addressLine1: { type: String },
    addressLine2: { type: String },
    addressLine3: { type: String },
    profession: { type: String },
    age: { type: Number, min: 18 },
    socialMediaID: { type: String },
    phone: { type: String, unique: true },
    personalityCategory: { type: String, enum: [
        'Strategic Leader', 'Expressive Connector', 'Independent Thinker', 'Resilient Caregiver', 'Tactical Realist'
    ], default: null },
    personalityScores: {
        openness: { type: Number, min: 5, max: 25, default: null },
        conscientiousness: { type: Number, min: 5, max: 25, default: null },
        extraversion: { type: Number, min: 5, max: 25, default: null },
        agreeableness: { type: Number, min: 5, max: 25, default: null },
        neuroticism: { type: Number, min: 5, max: 25, default: null }
    },
    bookingIds: [{ type: String }]
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;