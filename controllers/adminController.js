const User = require('../models/User');
const Flight = require('../models/Flight');
const Reservations = require('../models/Reservation');
const AuditLog = require('../models/AuditLog');
const {airlines, airports} = require('../constants/flightOptions');

//Admin views details
const adminDashboardView = {
    title: 'TravelBuddy - Dashboard',
    isAdmin: true,
    layout: 'main',
    extraCSS: [
        '/css/admin-style.css'
    ],
    extraJS: [
        '/js/admin.js'
    ]
};

const flightsMgmt = {
    title: 'TravelBuddy - Flights Management',
    isAdmin: true,
    layout: 'main',
    extraCSS: [
        '/css/admin-style.css'
    ],
    extraJS: [
        '/js/admin.js'
    ]
};

const reservationsMgmt = {
    title: 'TravelBuddy - Reservations Management',
    isAdmin: true,
    layout: 'main',
    extraCSS: [
        '/css/admin-style.css'
    ],
    extraJS: [
        '/js/admin.js'
    ]
};

const userMgmt = {
    title: 'TravelBuddy - Users Management',
    isAdmin: true,
    layout: 'main',
    extraCSS: [
        '/css/admin-style.css'
    ],
    extraJS: [
        '/js/admin.js'
    ]
};

// Admin dashboard page
exports.showAdminDashboard = async (req, res) => {
    try {
        const totalBookings = await Reservations.countDocuments();
        const activeBookingsCount = await Reservations.countDocuments({ status: { $ne: 'cancelled' } });
        const totalUsers = await User.countDocuments({ role: 'user' });

        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const bookingsThisMonth = await Reservations.countDocuments({ createdAt: { $gte: startOfMonth } });
        const usersThisMonth = await User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } });

        // Calculate Revenue and Popular Destinations
        const activeReservations = await Reservations.find({ status: { $ne: 'cancelled' } }).populate('flight');
        let totalRevenue = 0;
        const destCounts = {};

        activeReservations.forEach(r => {
            if (r.flight) {
                totalRevenue += r.flight.price || 0;
                const dest = r.flight.destination;
                if (dest) {
                    destCounts[dest] = (destCounts[dest] || 0) + 1;
                }
            }
        });

        const formattedRevenue = `₱${totalRevenue.toLocaleString('en-PH')}`;

        // Sort popular destinations by booking counts
        const colors = ['#0d6efd', '#0dcaf0', '#6610f2', '#d63384', '#fd7e14', '#198754', '#20c997', '#ffc107'];
        const sortedDests = Object.keys(destCounts).map(key => ({
            destination: key,
            count: destCounts[key]
        })).sort((a, b) => b.count - a.count);

        const maxCount = sortedDests.length > 0 ? sortedDests[0].count : 1;
        const popularDestinations = sortedDests.slice(0, 8).map((item, index) => ({
            destination: item.destination,
            countText: `${item.count} booking${item.count !== 1 ? 's' : ''}`,
            percentage: Math.round((item.count / maxCount) * 100),
            color: colors[index % colors.length]
        }));

        res.render('admin/dashboard', {
            ...adminDashboardView,
            totalBookings,
            bookingsStatText: `${bookingsThisMonth} new this month`,
            formattedRevenue,
            revenueStatText: `From ${activeBookingsCount} active booking${activeBookingsCount !== 1 ? 's' : ''}`,
            totalUsers,
            usersStatText: `${usersThisMonth} registered this month`,
            popularDestinations
        });
    } catch (err) {
        console.error("Error loading admin dashboard:", err);
        res.status(500).send("Server Error loading dashboard");
    }
};

/* --- format dates and info for table --- */
const formatFlight = (flightObj) => {
    const formatDateObj = (dateObj) => {
        if (!dateObj) return 'N/A';
        const dateInstance = new Date(dateObj);
        const datePart = dateInstance.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const timePart = dateInstance.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return `${datePart} (${timePart})`;
    };

    const toISOInput = (dateObj) => {
        if (!dateObj) return '';
        const dateInstance = new Date(dateObj);
        const pad = (num) => num.toString().padStart(2, '0');
        return `${dateInstance.getFullYear()}-${pad(dateInstance.getMonth() + 1)}-${pad(dateInstance.getDate())}T${pad(dateInstance.getHours())}:${pad(dateInstance.getMinutes())}`;
    };

    const statusBadgeMap = {
        'scheduled': 'success',
        'delayed': 'warning',
        'cancelled': 'danger'
    };

    return {
        _id: flightObj._id,
        flightCode: flightObj.flightCode,
        airline: flightObj.airline,
        origin: flightObj.origin,
        destination: flightObj.destination,
        departureDate: flightObj.departureDate,
        arrivalDate: flightObj.arrivalDate,
        availableSeats: flightObj.availableSeats,
        price: flightObj.price,
        status: flightObj.status,
        tripType: flightObj.tripType,
        departureFormatted: formatDateObj(flightObj.departureDate),
        arrivalFormatted: formatDateObj(flightObj.arrivalDate),
        departureDateISO: toISOInput(flightObj.departureDate),
        arrivalDateISO: toISOInput(flightObj.arrivalDate),
        priceFormatted: Number(flightObj.price || 0).toLocaleString('en-PH'),
        statusCapitalized: flightObj.status ? flightObj.status.charAt(0).toUpperCase() + flightObj.status.slice(1) : 'Scheduled',
        statusBadgeClass: statusBadgeMap[flightObj.status] || 'success',

        //Promo flight info
        isPromo: !!flightObj.isPromo,
        discountPercent: flightObj.isPromo ? Number(flightObj.discountPercent) || 0 : 0,
        discountLabel: flightObj.isPromo ? `${flightObj.discountPercent}% OFF` : "",
        promoLabel: flightObj.promoLabel || "",
        discountPrice: flightObj.isPromo ? Math.round(flightObj.price * (1 - flightObj.discountPercent / 100)) : flightObj.price,
        discountPriceFormatted: flightObj.isPromo
            ? Math.round(flightObj.price * (1 - flightObj.discountPercent / 100)).toLocaleString('en-PH')
            : '',
        promoStartDateISO: toISOInput(flightObj.promoStartDate),
        promoEndDateISO: toISOInput(flightObj.promoEndDate)


    };
};

/* --- show flights page --- */
// render flights page when clicked
exports.showFlightsMgmt = async (req, res) => {
    try {
        const rawFlights = await Flight.find().sort({ departureDate: 1 }).lean();
        const flights = rawFlights.map(formatFlight);
        res.render("admin/flights", {
            ...flightsMgmt,
            flights,
            airlines, 
            airports
        });
    } catch (errorObj) {
        console.error("Error loading flights management:", errorObj);
        res.status(500).send("Server Error loading flights");
    }
};

/* --- get flights dynamically --- */
// get flights for table and simple search without page refresh
exports.getFlightsAPI = async (req, res) => {
    try {
        const allFlights = await Flight.find().sort({ departureDate: 1 }).lean();
        const query = req.query.q ? req.query.q.trim().toLowerCase() : '';
        let filteredFlights = allFlights;

        if (query !== '') { // if user typed something in search bar check if it matches code or airline etc
            filteredFlights = allFlights.filter(flightItem => {
                const code = (flightItem.flightCode || '').toLowerCase();
                const airline = (flightItem.airline || '').toLowerCase();
                const origin = (flightItem.origin || '').toLowerCase();
                const destination = (flightItem.destination || '').toLowerCase();
                const status = (flightItem.status || '').toLowerCase();
                return code.includes(query) || airline.includes(query) || origin.includes(query) || destination.includes(query) || status.includes(query);
            });
        }
        const flights = filteredFlights.map(formatFlight);
        res.json({ success: true, flights });
    } catch (errorObj) {
        console.error("Error fetching flights API:", errorObj);
        res.status(500).json({ success: false, error: "Server error fetching flights" });
    }
};

/* --- promo validation for create and update flights  --- */
function validatePromoFields({ isPromo, discountPercent, promoStartDate, promoEndDate }) {
    if (!isPromo) return null;

    const pct = Number(discountPercent);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
        return "Discount must be a number between 1 and 100 when a flight is marked as promotional.";
    }
    if (!promoEndDate) {
        return "Promotion End date is required when a flight is marked as promotional.";
    }
    if (promoStartDate && new Date(promoEndDate) <= new Date(promoStartDate)) {
        return "Promotion End must be after Promotion Start.";
    }
    return null;
}


/* --- add new flight --- */
exports.createFlight = async (req, res) => {
    try {
        const { tripType, flightNum, flightStatus, airline, fromField, toField, departDate, arrivalDate, price, seats,
            isPromo, promoLabel, discountPercent, promoStartDate, promoEndDate
        } = req.body;

        // check if all fields are filled out
        if (!flightNum || !airline || !fromField || !toField || !departDate || !arrivalDate || price === undefined || seats === undefined) {
            return res.status(400).json({ success: false, error: "All fields are required." });
        }

        // check if origin is not the same as destination
        if (fromField === toField) {
            return res.status(400).json({ success: false, error: "Origin and destination cannot be the same." });
        }

        const parsedPrice = Number(price);
        const parsedSeats = Number(seats);

        // check if ticket price and seats are numbers
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({ success: false, error: "Ticket price must be a valid non-negative number." });
        }
        if (isNaN(parsedSeats) || parsedSeats < 0 || !Number.isInteger(parsedSeats)) {
            return res.status(400).json({ success: false, error: "Available seats must be a valid non-negative integer." });
        }

        const depDateObj = new Date(departDate);
        const arrDateObj = new Date(arrivalDate);

        if (isNaN(depDateObj.getTime()) || isNaN(arrDateObj.getTime())) {
            return res.status(400).json({ success: false, error: "Invalid departure or arrival date." });
        }
        // check if arrival time is after departure time
        if (arrDateObj <= depDateObj) {
            return res.status(400).json({ success: false, error: "Arrival date/time must be after departure date/time." });
        }

        // check if flight code already exists in db
        const existing = await Flight.findOne({ flightCode: flightNum.trim() });
        if (existing) {
            return res.status(400).json({ success: false, error: "A flight with this Flight Number already exists." });
        }


        const promoError = validatePromoFields({ isPromo: Boolean(isPromo), discountPercent, promoStartDate, promoEndDate });
        if (promoError) {
            return res.status(400).json({ success: false, error: promoError });
        }

        const newFlight = new Flight({
            flightCode: flightNum.trim(),
            airline: airline.trim(),
            origin: fromField.trim(),
            destination: toField.trim(),
            departureDate: depDateObj,
            arrivalDate: arrDateObj,
            price: parsedPrice,
            availableSeats: parsedSeats,
            status: flightStatus || 'scheduled',
            tripType: tripType || 'oneway',

            //for promo flights
            isPromo: Boolean(isPromo),
            promoLabel: promoLabel?.trim() || "",
            discountPercent: Boolean(isPromo) ? Number(discountPercent) || 0 : 0,
            promoStartDate: Boolean(isPromo) && promoStartDate ? promoStartDate : null,
            promoEndDate: Boolean(isPromo) && promoEndDate ? promoEndDate : null
        });

        await newFlight.save();
        
        await AuditLog.create({
            username: req.session.email || 'Admin',
            userRole: req.session.role || 'admin',
            activity: 'Flight Creation'
        });

        res.json({ success: true, flight: formatFlight(newFlight) });
    } catch (errorObj) {
        console.error("Error creating flight:", errorObj);
        res.status(500).json({ success: false, error: errorObj.message || "Server error creating flight." });
    }
};

/* --- update flight details --- */
exports.updateFlight = async (req, res) => {
    try {
        const { id } = req.params;
        const { tripType, flightNum, flightStatus, airline, fromField, toField, departDate, arrivalDate, price, seats,
            isPromo, promoLabel, discountPercent, promoStartDate, promoEndDate
        } = req.body;

        if (!flightNum || !airline || !fromField || !toField || !departDate || !arrivalDate || price === undefined || seats === undefined) {
            return res.status(400).json({ success: false, error: "All fields are required." });
        }

        if (fromField === toField) {
            return res.status(400).json({ success: false, error: "Origin and destination cannot be the same." });
        }

        const parsedPrice = Number(price);
        const parsedSeats = Number(seats);

        if (isNaN(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({ success: false, error: "Ticket price must be a valid non-negative number." });
        }
        if (isNaN(parsedSeats) || parsedSeats < 0 || !Number.isInteger(parsedSeats)) {
            return res.status(400).json({ success: false, error: "Available seats must be a valid non-negative integer." });
        }

        const depDateObj = new Date(departDate);
        const arrDateObj = new Date(arrivalDate);

        if (isNaN(depDateObj.getTime()) || isNaN(arrDateObj.getTime())) {
            return res.status(400).json({ success: false, error: "Invalid departure or arrival date." });
        }
        if (arrDateObj <= depDateObj) {
            return res.status(400).json({ success: false, error: "Arrival date/time must be after departure date/time." });
        }

        const flight = await Flight.findById(id);
        if (!flight) {
            return res.status(404).json({ success: false, error: "Flight not found." });
        }

        // check if another flight already has this code
        const existingCode = await Flight.findOne({ flightCode: flightNum.trim(), _id: { $ne: id } });
        if (existingCode) {
            return res.status(400).json({ success: false, error: "Another flight with this Flight Number already exists." });
        }

        // make sure bookings don't exceed available seats
        const confirmedBookingsCount = await Reservations.countDocuments({
            flight: id,
            status: { $ne: 'cancelled' }
        });

        if (parsedSeats < confirmedBookingsCount) {
            return res.status(400).json({
                success: false,
                error: `Available seats (${parsedSeats}) cannot be lower than existing active bookings (${confirmedBookingsCount} booked).`
            });
        }

        const promoError = validatePromoFields({ isPromo: Boolean(isPromo), discountPercent, promoStartDate, promoEndDate });
        if (promoError) {
            return res.status(400).json({ success: false, error: promoError });
        }
        

        flight.flightCode = flightNum.trim();
        flight.airline = airline.trim();
        flight.origin = fromField.trim();
        flight.destination = toField.trim();
        flight.departureDate = depDateObj;
        flight.arrivalDate = arrDateObj;
        flight.price = parsedPrice;
        flight.availableSeats = parsedSeats;
        flight.status = flightStatus || 'scheduled';
        flight.tripType = tripType || 'oneway';
        flight.isPromo = Boolean(isPromo);
        flight.promoLabel = Boolean(isPromo) ? promoLabel?.trim() || "" : "";
        flight.discountPercent = Boolean(isPromo) ? Number(discountPercent) || 0 : 0;
        flight.promoStartDate = Boolean(isPromo) && promoStartDate ? promoStartDate : null;
        flight.promoEndDate = Boolean(isPromo) && promoEndDate ? promoEndDate : null;

        await flight.save();

        await AuditLog.create({
            username: req.session.email || 'Admin',
            userRole: req.session.role || 'admin',
            activity: 'Flight Update'
        });

        res.json({ success: true, flight: formatFlight(flight) });
    } catch (errorObj) {
        console.error("Error updating flight:", errorObj);
        res.status(500).json({ success: false, error: errorObj.message || "Server error updating flight." });
    }
};

/* --- delete flight --- */
exports.deleteFlight = async (req, res) => {
    try {
        const { id } = req.params;
        const flight = await Flight.findById(id);
        if (!flight) {
            return res.status(404).json({ success: false, error: "Flight not found." });
        }

        // check if flight has active bookings before deleting so it doesn't mess up reservations
        const activeBookings = await Reservations.countDocuments({ flight: id, status: { $ne: 'cancelled' } });
        if (activeBookings > 0) {
            return res.status(400).json({
                success: false,
                error: `Cannot delete flight because it has ${activeBookings} active reservation(s). Please cancel reservations first.`
            });
        }

        await Flight.findByIdAndDelete(id);

        await AuditLog.create({
            username: req.session.email || 'Admin',
            userRole: req.session.role || 'admin',
            activity: 'Flight Deletion'
        });

        res.json({ success: true, id });
    } catch (errorObj) {
        console.error("Error deleting flight:", errorObj);
        res.status(500).json({ success: false, error: "Server error deleting flight." });
    }
};


/* --- format reservation info for table and modals --- */
const formatReservation = (resObj) => {
    const formatDateObj = (dateObj) => {
        if (!dateObj) return 'N/A';
        const dateInstance = new Date(dateObj);
        const datePart = dateInstance.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const timePart = dateInstance.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return `${datePart} (${timePart})`;
    };

    const formatBookingDate = (dateObj) => {
        if (!dateObj) return 'N/A';
        const dateInstance = new Date(dateObj);
        return dateInstance.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const statusBadgeMap = {
        'confirmed': 'success',
        'pending': 'warning',
        'cancelled': 'danger'
    };

    const userObj = resObj.user || {};
    const flightObj = resObj.flight || {};
    const passengerName = `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || 'Unknown Passenger';
    const priceVal = flightObj.isPromo ? Math.round((flightObj.price || 0) * (1 - (flightObj.discountPercent || 0) / 100)) : (flightObj.price || 0);

    return {
        _id: resObj._id,
        reservationNumber: resObj.reservationNumber || 'N/A',
        seat: resObj.seat || 'N/A',
        status: resObj.status || 'pending',
        statusCapitalized: resObj.status ? resObj.status.charAt(0).toUpperCase() + resObj.status.slice(1) : 'Pending',
        statusBadgeClass: statusBadgeMap[resObj.status] || 'warning',
        passengerName,
        passengerEmail: userObj.email || 'N/A',
        flightCode: flightObj.flightCode || 'N/A',
        origin: flightObj.origin || 'N/A',
        destination: flightObj.destination || 'N/A',
        departureFormatted: formatDateObj(flightObj.departureDate),
        arrivalFormatted: formatDateObj(flightObj.arrivalDate),
        bookingFormatted: formatBookingDate(resObj.createdAt),
        priceFormatted: Number(priceVal || 0).toLocaleString('en-PH')
    };
};

/* --- show reservations page --- */
exports.showReservationsMgmt = async (req, res) => {
    try {
        const rawList = await Reservations.find().populate('user').populate('flight').sort({ createdAt: -1 }).lean();
        const reservations = rawList.map(formatReservation);
        res.render('admin/reservations', {
            ...reservationsMgmt,
            reservations
        });
    } catch (errorObj) {
        console.error("Error loading reservations management:", errorObj);
        res.status(500).send("Server Error loading reservations");
    }
};

/* --- get reservations dynamically --- */
exports.getReservationsAPI = async (req, res) => {
    try {
        const allList = await Reservations.find().populate('user').populate('flight').sort({ createdAt: -1 }).lean();
        const query = req.query.q ? req.query.q.trim().toLowerCase() : '';
        const statusFilter = req.query.status ? req.query.status.trim().toLowerCase() : 'all';

        let filteredList = allList;

        if (query !== '') {
            filteredList = filteredList.filter(item => {
                const resNum = (item.reservationNumber || '').toLowerCase();
                const userObj = item.user || {};
                const name = `${userObj.firstName || ''} ${userObj.lastName || ''}`.toLowerCase();
                const email = (userObj.email || '').toLowerCase();
                const flightCode = item.flight ? (item.flight.flightCode || '').toLowerCase() : '';
                return resNum.includes(query) || name.includes(query) || email.includes(query) || flightCode.includes(query);
            });
        }

        if (statusFilter !== 'all' && statusFilter !== '') {
            filteredList = filteredList.filter(item => (item.status || 'pending').toLowerCase() === statusFilter);
        }

        const reservations = filteredList.map(formatReservation);
        res.json({ success: true, reservations });
    } catch (errorObj) {
        console.error("Error fetching reservations API:", errorObj);
        res.status(500).json({ success: false, error: "Server error fetching reservations" });
    }
};

/* --- update reservation status --- */
exports.updateReservationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, error: "Status is required." });
        }

        const validStatuses = ['confirmed', 'pending', 'cancelled'];
        if (!validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({ success: false, error: "Invalid status selected." });
        }

        const reservation = await Reservations.findById(id).populate('user').populate('flight');
        if (!reservation) {
            return res.status(404).json({ success: false, error: "Reservation not found." });
        }

        reservation.status = status.toLowerCase();
        await reservation.save();

        res.json({ success: true, reservation: formatReservation(reservation) });
    } catch (errorObj) {
        console.error("Error updating reservation status:", errorObj);
        res.status(500).json({ success: false, error: errorObj.message || "Server error updating reservation." });
    }
};

/* --- delete reservation --- */
exports.deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const reservation = await Reservations.findById(id);
        if (!reservation) {
            return res.status(404).json({ success: false, error: "Reservation not found." });
        }

        await Reservations.findByIdAndDelete(id);
        res.json({ success: true, id });
    } catch (errorObj) {
        console.error("Error deleting reservation:", errorObj);
        res.status(500).json({ success: false, error: "Server error deleting reservation." });
    }
};

/* --- format user info for table --- */
const formatUser = (userObj) => {
    const formatDateObj = (dateObj) => {
        if (!dateObj) return 'N/A';
        const dateInstance = new Date(dateObj);
        return dateInstance.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const statusVal = userObj.status || 'active';
    const isDeactivated = statusVal === 'deactivated';

    return {
        _id: userObj._id,
        name: `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || 'Unknown User',
        email: userObj.email || 'N/A',
        phone: userObj.phone || userObj.contactNumber || 'N/A',
        role: userObj.role || 'user',
        roleCapitalized: (userObj.role === 'admin') ? 'Admin' : 'Customer',
        dateRegistered: formatDateObj(userObj.createdAt),
        status: statusVal,
        statusCapitalized: isDeactivated ? 'Deactivated' : 'Active',
        statusBadgeClass: isDeactivated ? 'danger' : 'success',
        isDeactivated
    };
};

/* --- show users page --- */
exports.showUserMgmt = async (req, res) => {
    try {
        const rawList = await User.find().sort({ createdAt: -1 }).lean();
        const users = rawList.map(formatUser);
        res.render('admin/users', {
            ...userMgmt,
            users
        });
    } catch (errorObj) {
        console.error("Error loading users management:", errorObj);
        res.status(500).send("Server Error loading users");
    }
};

/* --- get users dynamically --- */
exports.getUsersAPI = async (req, res) => {
    try {
        const allList = await User.find().sort({ createdAt: -1 }).lean();
        const query = req.query.q ? req.query.q.trim().toLowerCase() : '';
        const roleFilter = req.query.role ? req.query.role.trim().toLowerCase() : 'all';
        const statusFilter = req.query.status ? req.query.status.trim().toLowerCase() : 'all';

        let filteredList = allList;

        if (query !== '') {
            filteredList = filteredList.filter(item => {
                const fullName = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
                const email = (item.email || '').toLowerCase();
                const phone = (item.phone || item.contactNumber || '').toLowerCase();
                return fullName.includes(query) || email.includes(query) || phone.includes(query);
            });
        }

        if (roleFilter !== 'all' && roleFilter !== '') {
            filteredList = filteredList.filter(item => (item.role || 'user').toLowerCase() === roleFilter);
        }

        if (statusFilter !== 'all' && statusFilter !== '') {
            filteredList = filteredList.filter(item => (item.status || 'active').toLowerCase() === statusFilter);
        }

        const users = filteredList.map(formatUser);
        res.json({ success: true, users });
    } catch (errorObj) {
        console.error("Error fetching users API:", errorObj);
        res.status(500).json({ success: false, error: "Server error fetching users" });
    }
};

/* --- Audit Logs View --- */
exports.showAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ date: -1 }).lean();
        
        // Format dates for display
        const formattedLogs = logs.map(log => ({
            ...log,
            formattedDate: new Date(log.date).toLocaleString('en-US', {
                month: 'short', day: '2-digit', year: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true
            })
        }));

        res.render('admin/auditLogs', {
            title: 'TravelBuddy - Audit Logs',
            layout: 'admin-main',
            logs: formattedLogs
        });
    } catch (error) {
        console.error("Error retrieving audit logs:", error);
        res.status(500).send("Server error retrieving audit logs.");
    }
};

/* --- toggle active or deactivated --- */
exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found." });
        }

        user.status = (user.status === 'active') ? 'deactivated' : 'active';
        await user.save();

        res.json({ success: true, user: formatUser(user) });
    } catch (errorObj) {
        console.error("Error toggling user status:", errorObj);
        res.status(500).json({ success: false, error: errorObj.message || "Server error updating user." });
    }
};
