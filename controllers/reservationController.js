const User = require('../models/User');
const Reservations = require('../models/Reservation');
const Flight = require('../models/Flight');

//Reservations-related views details
const reservationsView = {
    title: 'TravelBuddy - Reservations',
    layout: 'main',
    extraCSS: [
        '/css/profile.css'
    ],
    extraJS: [
        '/js/reservations.js'
    ]
};

const bookingView = {
    title: 'TravelBuddy - Booking',
    layout: 'main',
    extraCSS: [
        '/css/booking.css'
    ],
    extraJS: [
        '/js/booking.js'
    ]
};

//Renders user reservations page
exports.showReservations = (req, res) => {
    res.render('user/reservations', {
        ...reservationsView
    });
};

//User reservations logic goes here

//Renders booking page
exports.showBooking = (req, res) => {
    res.render('user/booking', {
        ...bookingView
    });
};

//Booking logic goes here
// Create a new booking 
exports.createBooking = async (req, res) => {
    const { firstName, lastName, contactCode, contactNumber, 
        email, passport, nationality, dobMonth, dobDay, dobYear, gender
    } = req.body;

    // check if all fields are filled out
    if (!firstName || !lastName ||  !passport || seats == undefined) {
            return res.status(400).json({ success: false, error: "All fields are required." });
    }
}
