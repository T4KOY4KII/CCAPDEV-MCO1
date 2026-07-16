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

//Renders user reservations page
exports.showReservations = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');

        const reservations = await Reservations.find({ user: req.session.userId });

        const reservationList = [];
        for (const r of reservations) {
            const flight = await Flight.findById(r.flight);
            reservationList.push({
                _id: r._id,
                reservationNumber: r.reservationNumber,
                flightNumber: flight ? flight.flightCode : 'N/A',
                passengerName: r.passengerName,
                seat: r.seat,
                status: r.status,
                createdAt: r.createdAt
            });
        }

        res.render('user/reservations', { ...reservationsView, reservations: reservationList, reservationsJSON: JSON.stringify(reservationList) });
    } catch (err) {
        console.error('Show reservations error:', err);
        res.status(500).send('Something went wrong.');
    }
};

//Updates the seat on an existing reservation
exports.updateSeat = async (req, res) => {
    try {
        const { seat } = req.body;
        if (!seat) return res.status(400).json({ error: 'Seat is required.' });

        const reservation = await Reservations.findOneAndUpdate(
            { _id: req.params.id, user: req.session.userId },
            { seat },
            { returnDocument: 'after' }
        );

        if (!reservation) return res.status(404).json({ error: 'Reservation not found.' });

        res.json({ success: true, reservation });
    } catch (err) {
        console.error('Update seat error:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};

//Cancels a reservation
exports.cancelReservation = async (req, res) => {
    try {
        const reservation = await Reservations.findOneAndUpdate(
            { _id: req.params.id, user: req.session.userId },
            { status: 'cancelled' },
            { returnDocument: 'after' }
        );

        if (!reservation) return res.status(404).json({ error: 'Reservation not found.' });

        res.json({ success: true, reservation });
    } catch (err) {
        console.error('Cancel reservation error:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};


