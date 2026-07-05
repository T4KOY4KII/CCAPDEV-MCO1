const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    reservationNumber: { type: String, unique: true },
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    flight: {type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true},
    seat: {type: String, required: true},
    status: {type: String, enum: ['confirmed', 'pending', 'cancelled'], default: 'pending'}
}, { timestamps: true }); // not the complete schema for reservations - just a placeholder for now

module.exports = mongoose.model('Reservation', reservationSchema);