//ADMIN ROUTES

const express = require("express");
const router = express.Router();

//Dashboard page route
router.get('/adminDashboard', (req, res) => {
    res.render('admin/dashboard', { 
        title: 'TravelBuddy - Dashboard',
        isAdmin: true, 
        layout: 'main',
        extraCSS: [
            '/css/admin-style.css'
        ],
        extraJS: [
            '/js/admin.js'
        ]
    });
});

//Flights management page route
router.get('/adminFlights', (req, res) => {
    res.render("admin/flights", { 
        title: 'TravelBuddy - Flights Management',
        isAdmin: true, 
        layout: 'main',
        extraCSS: [
            '/css/admin-style.css'
        ],
        extraJS: [
            '/js/admin.js'
        ]
    });
});

//Reservations management page route
router.get('/adminReservations', (req, res) => {
    res.render('admin/reservations', { 
        title: 'TravelBuddy - Reservations Management',
        isAdmin: true, 
        layout: 'main',
        extraCSS: [
            '/css/admin-style.css'
        ],
        extraJS: [
            '/js/admin.js'
        ]
    });
});

//User management page route
router.get('/adminUsers', (req, res) => {
    res.render('admin/users', { 
        title: 'TravelBuddy - Users Management',
        isAdmin: true, 
        layout: 'main',
        extraCSS: [
            '/css/admin-style.css'
        ],
        extraJS: [
            '/js/admin.js'
        ] 
    });
});

module.exports = router;