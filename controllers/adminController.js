const User = require('../models/User');
const Flight = require('../models/Flight');
const Reservations = require('../models/Reservation');

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

//Renders admin dashboard page
exports.showAdminDashboard = (req, res) => {
    res.render('admin/dashboard', {
        ...adminDashboardView
    });
};

//Admin dashboard logic goes here


//Renders flights management page
exports.showFlightsMgmt = (req, res) => {
    res.render("admin/flights", {
        ...flightsMgmt
    });
};

//Flights management logic goes here


//Renders reservation management page
exports.showReservationsMgmt = (req, res) => {
    res.render('admin/reservations', {
        ...reservationsMgmt
    });
};

//Reservations management logic goes here

//Renders user management page
exports.showUserMgmt = (req, res) => {
    res.render('admin/users', {
        ...userMgmt
    });
}
