const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    flightCode: { type: String, required: true, unique: true },
    airline: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    departureDate: { type: Date, required: true },
    arrivalDate: { type: Date, required: true },
    availableSeats: { type: Number, required: true, min: [0, 'Available seats cannot be negative'] },
    price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
    status: { type: String, enum: ['scheduled', 'delayed', 'cancelled'], default: 'scheduled' },
    tripType: { type: String, enum: ['oneway', 'round'], default: 'oneway' }
}, { timestamps: true });

module.exports = mongoose.model('Flight', flightSchema);