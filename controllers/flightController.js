const User = require('../models/User');
const Flight = require('../models/Flight');

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


//Renders dashboard page
exports.showDashboard = (req, res) => {
    res.render('user/dashboard', {
        ...dashboardView
    });
};

//Dashboard logic goes here


//Renders flight search page
exports.showSearch = (req, res) => {
    res.render('user/search', {
        ...searchView
    });
};

//Search logic goes here