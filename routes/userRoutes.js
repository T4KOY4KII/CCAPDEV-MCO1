//USER ROUTES

const express = require("express");
const router = express.Router();

//Dashboard page route
router.get('/dashboard', (req, res) => {
    res.render('user/dashboard', {
        title: 'TravelBuddy - Dashboard',
        layout: 'main',
        extraCSS: [
            '/css/dashboard.css'
        ],
        extraJS: [
            '/js/flight-info.js',
            '/js/search-flight.js'
        ],

        //only for testing
        firstName: "Jose",
        lastName: "Rizal",
        profileIMG: "/imgs/users/jose-rizal.jpg"
    });
});

//Search page route
router.get('/search', (req, res) => {
    res.render('user/search', {
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
    });

})

//Booking page route
router.get('/booking', (req, res) => {
    res.render('user/booking', {
        title: 'TravelBuddy - Booking',
        layout: 'main',
        extraCSS: [
            '/css/booking.css'
        ],
        extraJS: [
            '/js/booking.js'
        ]
    });
})

//Reservations page route
router.get('/reservations', (req, res) => {
    res.render('user/reservations', {
        title: 'TravelBuddy - Reservations',
        layout: 'main',
        extraCSS: [
            '/css/profile.css'
        ],
        extraJS: [
            '/js/reservations.js'
        ]
    });

});

//Profile page route
router.get('/profile', (req, res) => {
    res.render('user/profile', {
        title: 'TravelBuddy - Profile',
        layout: 'main',
        extraCSS: [
            '/css/profile.css'
        ],
        extraJS: [
            '/js/profile.js'
        ]
    });
});

module.exports = router;