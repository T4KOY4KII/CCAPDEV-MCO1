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
async function bookFlight(req, res){
    try{
        /* Assuming request body contains necessary details for flight booking */

        const {firstName, lastName, contactCode, contactNumber, email, passport, nationality, dobMonth,
            dobDay, dobYear, gender,
        } = req.body;

        // New flight booking document in database //
        const booking = await User.create({
            firstName,
            lastName,
            contactCode,
            email,
            passport,
            nationality,
            dobMonth,
            dobDay,
            dobYear,
            gender,
            type: 'Flight'
            // Store flight details in database
        });

        res.status(201).json({booking});
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
}







