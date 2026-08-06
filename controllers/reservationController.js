const User = require('../models/User');
const Reservations = require('../models/Reservation');
const Flight = require('../models/Flight');
const AuditLog = require('../models/AuditLog');
const createAuditLog = require('../middleware/auditLogger');
const { mealOptions, seatPricing, extraServicesPricing, taxRate } = require('../constants/flightOptions');

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

function formatPHP(amount) {
    return 'PHP ' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

//Builds a single seat object for the seat map and if it's taken or premium
function makeSeat(rowNum, letter, isPremium, takenSet) {
    const id = rowNum + letter;
    const isOccupied = takenSet.has(id);
    let cssClass = 'seat';
    if (isOccupied) cssClass += ' occupied';
    else if (isPremium) cssClass += ' premium';
    else cssClass += ' available';
    return { id, letter, isPremium, isOccupied, cssClass };
}

//Builds the full seat map wherein row 1 is premium (2+2 layout), rows 2-6 are regular (3+3 layout)
function buildSeatMap(takenSeats) {
    const takenSet = new Set(takenSeats);
    const rows = [];

    rows.push({
        rowNum: 1,
        isPremium: true,
        leftSeats: ['A', 'B'].map(l => makeSeat(1, l, true, takenSet)),
        rightSeats: ['C', 'D'].map(l => makeSeat(1, l, true, takenSet))
    });

    for (let r = 2; r <= 6; r++) {
        rows.push({
            rowNum: r,
            isPremium: false,
            leftSeats: ['A', 'B', 'C'].map(l => makeSeat(r, l, false, takenSet)),
            rightSeats: ['D', 'E', 'F'].map(l => makeSeat(r, l, false, takenSet))
        });
    }

    return rows;
}

//Recalculates total price based on flight base price, seat selection, meal, baggage count, and extras
function calculateTotalPrice(flightPrice, seat, mealValue, baggageCount, extras) {
    const isPremiumSeat = seat.startsWith('1');
    const selectedMeal = mealOptions.find(m => m.value === mealValue) || mealOptions[0];
    const bagCount = Math.max(0, Math.min(5, parseInt(baggageCount, 10) || 0));

    let subtotal = flightPrice;
    if (isPremiumSeat) subtotal += seatPricing.premiumSurcharge;
    subtotal += selectedMeal.price;
    subtotal += bagCount * extraServicesPricing.baggagePerUnit;
    if (extras.priorityBoarding) subtotal += extraServicesPricing.priorityBoarding;
    if (extras.travelInsurance) subtotal += extraServicesPricing.travelInsurance;
    if (extras.loungeAccess) subtotal += extraServicesPricing.loungeAccess;

    const total = subtotal + (subtotal * taxRate);
    return Math.round(total * 100) / 100;
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

        //Real occupied seats for this flight, so the seat map reflects actual bookings
        const activeReservations = await Reservations.find({ flight: flight._id, status: { $ne: 'cancelled' } }, 'seat');
        const takenSeats = activeReservations.map(r => r.seat);
        const seatMap = buildSeatMap(takenSeats);

        //Pricing config sent to the page so booking.js can calculate live totals as the user picks add-ons
        const pricingConfig = {
            basePrice: flight.price,
            seatPremiumSurcharge: seatPricing.premiumSurcharge,
            mealOptions: mealOptions,
            baggagePerUnit: extraServicesPricing.baggagePerUnit,
            priorityBoardingPrice: extraServicesPricing.priorityBoarding,
            travelInsurancePrice: extraServicesPricing.travelInsurance,
            loungeAccessPrice: extraServicesPricing.loungeAccess,
            taxRate: taxRate
        };

        //Pre-formatted PHP strings for the initial server-rendered page, before booking.js takes over
        const pricingDisplay = {
            basePrice: formatPHP(flight.price),
            seatPremiumSurcharge: formatPHP(seatPricing.premiumSurcharge),
            baggagePerUnit: formatPHP(extraServicesPricing.baggagePerUnit),
            priorityBoardingPrice: formatPHP(extraServicesPricing.priorityBoarding),
            travelInsurancePrice: formatPHP(extraServicesPricing.travelInsurance),
            loungeAccessPrice: formatPHP(extraServicesPricing.loungeAccess),
            taxRatePercent: Math.round(taxRate * 100),
            zero: formatPHP(0)
        };

        const mealOptionsDisplay = mealOptions.map(m => ({
            ...m,
            priceFormatted: m.price > 0 ? ('+PHP ' + m.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })) : 'Included'
        }));

        res.render('user/booking', {
            ...bookingView,
            flight: formattedFlight,
            seatMap,
            mealOptions: mealOptionsDisplay,
            pricingDisplay,
            pricingConfigJSON: JSON.stringify(pricingConfig)
        });
    } catch (err) {
        console.error('Show booking error:', err);
        res.status(500).send('Something went wrong.');
    }
};

//Creates a new booking
exports.createBooking = async (req, res) => {
    try {
        const { firstName, lastName, email, passportNumber, seat, meal, baggageCount, priorityBoarding, travelInsurance, loungeAccess } = req.body;

        if (!firstName || !lastName || !email || !passportNumber || !seat) {
            return res.status(400).json({ success: false, error: 'All fields are required.' });
        }

        const flight = await Flight.findById(req.params.flightId);
        if (!flight) return res.status(404).json({ success: false, error: 'Flight not found.' });
        if (flight.availableSeats <= 0) return res.status(400).json({ success: false, error: 'This flight has no available seats.' });

        //Checks that this specific seat isn't already taken by an active reservation on this flight
        const seatTaken = await Reservations.findOne({ flight: flight._id, seat, status: { $ne: 'cancelled' } });
        if (seatTaken) return res.status(400).json({ success: false, error: 'That seat is already taken. Please choose another.' });

        const extras = {
            priorityBoarding: !!priorityBoarding,
            travelInsurance: !!travelInsurance,
            loungeAccess: !!loungeAccess
        };
        const bagCount = Math.max(0, Math.min(5, parseInt(baggageCount, 10) || 0));
        const selectedMeal = mealOptions.find(m => m.value === meal) ? meal : mealOptions[0].value;
        const totalPrice = calculateTotalPrice(flight.price, seat, selectedMeal, bagCount, extras);

        const reservationNumber = 'RES-' + Date.now();

        const newReservation = new Reservations({
            reservationNumber,
            user: req.session.userId,
            flight: flight._id,
            seat,
            status: 'confirmed',
            passengerName: firstName + ' ' + lastName,
            passportNumber,
            meal: selectedMeal,
            baggageCount: bagCount,
            extras,
            totalPrice
        });
        await newReservation.save();

        flight.availableSeats -= 1;
        await flight.save();

        await createAuditLog(req, "Reservation Creation");

        res.json({ success: true, reservationNumber, totalPrice });
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

        //Restore the seat to the flight's available seats count
        const flight = await Flight.findById(reservation.flight);
        if (flight) {
            flight.availableSeats += 1;
            await flight.save();
        }

        await createAuditLog(req, "Reservation Cancellation");

        res.json({ success: true, reservation });
    } catch (err) {
        console.error('Cancel reservation error:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};