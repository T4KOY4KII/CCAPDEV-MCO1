const User = require('../models/User');
const Reservations = require('../models/Reservation');
const Flight = require('../models/Flight');

//User views details
const profileView = {
    title: 'TravelBuddy - Profile',
    layout: 'main',
    extraCSS: [
        '/css/profile.css'
    ],
    extraJS: [
        '/js/profile.js'
    ]
};

//Renders profile page
exports.showProfile = (req, res) => {
    res.render('user/profile', {
        ...profileView
    });
}

//Profile logic goes here