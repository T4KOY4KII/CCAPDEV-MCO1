const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    reservationNumber: { type: String, unique: true },
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    flight: {type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true},
    seat: {type: String, required: true},
    status: {type: String, enum: ['confirmed', 'pending', 'cancelled'], default: 'pending'},
    passengerName: { type: String, required: true },
    //Add-ons selected during booking
    meal: { type: String, default: 'Standard' },
    baggageCount: { type: Number, default: 0, min: 0 },
    extras: {
        priorityBoarding: { type: Boolean, default: false },
        travelInsurance: { type: Boolean, default: false },
        loungeAccess: { type: Boolean, default: false }
    },
    //Final price including seat surcharge, meal, extras, and taxes that's calculated server-side at booking time
    totalPrice: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);