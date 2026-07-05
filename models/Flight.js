const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    flightCode: { type: String, required: true, unique: true },
    airline: { type: String, enum: ['Cebu Pacific', 'Philippine Airlines'], required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    departureDate: { type: Date, required: true },
    arrivalDate: { type: Date, required: true },
    availableSeats: { type: Number, required: true },
    price: { type: Number, required: true },
    status: {type: String, enum: ['scheduled', 'delayed', 'cancelled'], default: 'scheduled'}
}, { timestamps: true }); // not the complete schema for flights - just a placeholder for now

module.exports = mongoose.model('Flight', flightSchema);