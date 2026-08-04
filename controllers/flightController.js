const User = require('../models/User');
const Flight = require('../models/Flight');
const Reservation = require('../models/Reservation');
const { airlines, airports } = require('../constants/flightOptions');

//Flight-related views details
const dashboardView = {
    title: 'TravelBuddy - Dashboard',
    layout: 'main',
    extraCSS: [
        '/css/dashboard.css'
    ],
    extraJS: [
        '/js/flight-info.js',
        '/js/search-flight.js'
    ]
};

const searchView = {
    title: 'TravelBuddy - Search',
    layout: 'main',
    extraCSS: [
        '/css/search.css'
    ],
    extraJS: [
        '/js/search.js',
        '/js/flight-info.js',
        '/js/search-flight.js'
    ]
};

//Helper functions
const getFlightDuration = (departure, arrival) => {
    const diff = new Date(arrival) - new Date(departure);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
};

const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit'
    });
};

const formatFlight = (flight) => {
    const now = new Date();

    const promoActive = flight.discountPercent > 0 && flight.promoEndDate && new Date(flight.promoEndDate) >= now;

    return {
        ...flight,
        departureDate: formatDate(flight.departureDate),
        arrivalDate: formatDate(flight.arrivalDate),
        departureTime: formatTime(flight.departureDate),
        arrivalTime: formatTime(flight.arrivalDate),
        flightDuration: getFlightDuration(
            flight.departureDate,
            flight.arrivalDate
        ),

        promoEndFormatted: flight.promoEndDate
            ? formatDate(flight.promoEndDate)
            : "Limited time",

        // apply discount if promot is active
        discountPercent: promoActive ? flight.discountPercent : 0,

        discountedPrice: promoActive ? Math.round(flight.price - (flight.price * flight.discountPercent / 100)) : flight.price
    };
};



//Renders dashboard page
exports.showDashboard = async (req, res) => {

    try {

        //Flight statistics
        const availableFlights = await Flight.countDocuments({ availableSeats: { $gt: 0 }, departureDate: { $gte: new Date() } });
        const activeBookings = await Reservation.countDocuments({ status: 'confirmed' });
        const popularDestinations = await Flight.distinct('destination');


        const stats = {
            availableFlights,
            activeBookings,
            popularDestinations: popularDestinations.length
        };


        //Promo flights
        const promoFlights = await Flight.find({
            discountPercent: { $gt: 0 },
            availableSeats: { $gt: 0 },
            departureDate: { $gte: new Date() },
            promoEndDate: { $gte: new Date() }
        }).limit(6).lean();


        const formattedPromos = promoFlights.map(formatFlight);

        //Groups the promos into 3 for the carousel slides
        const promotionSlides = [];
        for (let i = 0; i < formattedPromos.length; i += 3) {
            promotionSlides.push(formattedPromos.slice(i, i + 3));
        }


        //Recently viewed from session 
        let recentlyViewed = [];

        const viewedIds = req.session.recentlyViewed || [];

        if (viewedIds.length > 0) {

            const viewedFlights = await Flight.find({ _id: { $in: viewedIds } }).lean();
            const flightMap = {};
            viewedFlights.forEach(f => { flightMap[f._id.toString()] = f; });

            recentlyViewed = viewedIds
                .map(id => flightMap[id])
                .filter(Boolean)
                .map(formatFlight);

        };


        res.render('user/dashboard', {
            ...dashboardView,
            airports,
            stats,
            promotionSlides,
            recentlyViewed,
            hasPromos: promotionSlides.length > 0,
            hasRecentlyViewed: recentlyViewed.length > 0
        });

    } catch (err) {
        console.error('Dashboard error:', err);
        res.render('user/dashboard', {
            ...dashboardView,
            airports: [],
            stats: { availableFlights: 0, activeBookings: 0, popularDestinations: 0 },
            promotionSlides: [],
            recentlyViewed: [],
            hasPromos: false,
            hasRecentlyViewed: false,
            error: 'Could not load flight data.'
        });
    }

};

//Renders flight search page
exports.showSearch = async (req, res) => {
    try {
        // Show all currently bookable flights by default
        const flights = await Flight.find({
            availableSeats: { $gt: 0 },
            departureDate: { $gte: new Date() }

        }).lean();
        const formattedFlights = flights.map(formatFlight);

        res.render('user/search', {
            ...searchView,
            airports,
            airlines,
            flights: formattedFlights,
            hasFlights: formattedFlights.length > 0,
            totalResults: formattedFlights.length
        });
    } catch (err) {
        console.error('Search page error:', err);
        res.render('user/search', {
            ...searchView,
            airports,
            airlines,
            flights: [],
            hasFlights: false,
            totalResults: 0,
            error: 'Could not load flight data.'
        });
    }
};

exports.searchFlights = async (req, res) => {
    const {
        origin,
        destination,
        departDate,
        returnDate,
        tripType,
        passengers,
        cabinClass
    } = req.query;

    try {

        const totalPassengers = Math.max(parseInt(req.query.passengers) || 1, 1);
        const now = new Date();

        const query = {
            availableSeats: { $gte: totalPassengers },
            departureDate: { $gte: now }
        };

        if (origin) query.origin = origin;
        if (destination) query.destination = destination;
        if (tripType) query.tripType = tripType;

        // Match departure date (same calendar day)
        if (departDate) {
            const start = new Date(departDate);
            const end = new Date(departDate);
            end.setDate(end.getDate() + 1);
            query.departureDate = { $gte: start > now ? start : now, $lt: end };
        }

        const flights = await Flight.find(query).lean();
        const formattedFlights = flights.map(formatFlight);


        res.render('user/search', {
            ...searchView,
            airports,
            airlines,
            flights: formattedFlights,
            hasFlights: formattedFlights.length > 0,
            totalResults: formattedFlights.length,
            searchParams: {
                origin,
                destination,
                departDate,
                returnDate,
                tripType,
                passengers: totalPassengers,
                cabinClass
            }
        });

    } catch (err) {
        console.error('Search error:', err);
        res.render('user/search', {
            ...searchView,
            airports,
            airlines,
            flights: [],
            hasFlights: false,
            error: 'Could not fetch flights. Please try again.'
        });
    }
};

//Flight details
exports.showFlightDetails = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id).lean();

        if (!flight) {
            return res.status(404).render('error', {
                layout: 'main',
                title: 'Flight Not Found',
                message: 'The flight you are looking for does not exist.'
            });
        }

        // Track recently viewed in session
        if (req.session) {
            const viewed = req.session.recentlyViewed || [];
            const flightIdStr = flight._id.toString();

            // Remove duplicate then add to front
            const filtered = viewed.filter(id => id !== flightIdStr);
            filtered.unshift(flightIdStr);

            // Keep only last 5
            req.session.recentlyViewed = filtered.slice(0, 5);

        }

        const formattedFlight = formatFlight(flight);

        res.render('user/flight-details', {
            title: `TravelBuddy - ${flight.origin} to ${flight.destination}`,
            layout: 'main',
            extraCSS: ['/css/flight-details.css'],
            extraJS: ['/js/flight-details.js'],
            flight: formattedFlight
        });

    } catch (err) {
        console.error('Flight details error:', err);
        res.redirect('/search');
    }
};

exports.trackViewedFlight = async (req, res) => {
    try {
        const flightId = req.params.id;

        const viewed = req.session.recentlyViewed || [];

        const filtered = viewed.filter(id => id !== flightId);
        filtered.unshift(flightId);

        req.session.recentlyViewed = filtered.slice(0, 5);

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
}
