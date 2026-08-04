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

// Helper functions to format date and time
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Create a new booking 
exports.bookFlight = async (req, res) => {
    try {
        /* Assuming request body contains necessary details for flight booking */

        const { firstName, lastName, contactCode, contactNumber, email, passport, nationality, dobMonth,
            dobDay, dobYear, gender,
        } = req.body;

        // New flight booking document in database 
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

        res.status(201).json({ booking });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};


//Renders booking page
exports.showBooking = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.flightId).lean();
        if (!flight) return res.status(404).send('Flight not found.');

        const formattedFlight = {
            ...flight,
            departureDateFormatted: formatDate(flight.departureDate),
            departureTimeFormatted: formatTime(flight.departureDate),
            arrivalDateFormatted: formatDate(flight.arrivalDate),
            arrivalTimeFormatted: formatTime(flight.arrivalDate)
        };

        res.render('user/booking', { ...bookingView, flight: formattedFlight });
    } catch (err) {
        console.error('Show booking error:', err);
        res.status(500).send('Something went wrong.');
    }
};

//Creates a new booking
exports.createBooking = async (req, res) => {
    try {
        const { firstName, lastName, email, passportNumber, seat } = req.body;

        if (!firstName || !lastName || !email || !passportNumber || !seat) {
            return res.status(400).json({ success: false, error: 'All fields are required.' });
        }

        const flight = await Flight.findById(req.params.flightId);
        if (!flight) return res.status(404).json({ success: false, error: 'Flight not found.' });
        if (flight.availableSeats <= 0) return res.status(400).json({ success: false, error: 'This flight has no available seats.' });

        //Checks that this specific seat isn't already taken by an active reservation on this flight
        const seatTaken = await Reservations.findOne({ flight: flight._id, seat, status: { $ne: 'cancelled' } });
        if (seatTaken) return res.status(400).json({ success: false, error: 'That seat is already taken. Please choose another.' });

        const reservationNumber = 'RES-' + Date.now();

        const newReservation = new Reservations({
            reservationNumber,
            user: req.session.userId,
            flight: flight._id,
            seat,
            status: 'confirmed',
            passengerName: firstName + ' ' + lastName
        });
        await newReservation.save();

        flight.availableSeats -= 1;
        await flight.save();

        res.json({ success: true, reservationNumber });
    } catch (err) {
        console.error('Create booking error:', err);
        res.status(500).json({ success: false, error: 'Something went wrong.' });
    }
};

//Renders user reservations page
exports.showReservations = async (req, res) => {
    try {
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

        const reservation = await Reservations.findOne({ _id: req.params.id, user: req.session.userId });
        if (!reservation) return res.status(404).json({ error: 'Reservation not found.' });

        //Checks that the new seat isn't already taken by a different active reservation on this flight
        const seatTaken = await Reservations.findOne({
            _id: { $ne: reservation._id },
            flight: reservation.flight,
            seat,
            status: { $ne: 'cancelled' }
        });
        if (seatTaken) return res.status(400).json({ error: 'That seat is already taken. Please choose another.' });

        reservation.seat = seat;
        await reservation.save();

        res.json({ success: true, reservation });
    } catch (err) {
        console.error('Update seat error:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};

//Cancels a reservation
exports.cancelReservation = async (req, res) => {
    try {
        const reservation = await Reservations.findOne({ _id: req.params.id, user: req.session.userId });
        if (!reservation) return res.status(404).json({ error: 'Reservation not found.' });

        //Already cancelled - don't restore the seat a second time if this gets called twice
        if (reservation.status === 'cancelled') {
            return res.json({ success: true, reservation });
        }

        reservation.status = 'cancelled';
        await reservation.save();

        await Flight.findByIdAndUpdate(reservation.flight, { $inc: { availableSeats: 1 } });

        res.json({ success: true, reservation });
    } catch (err) {
        console.error('Cancel reservation error:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};