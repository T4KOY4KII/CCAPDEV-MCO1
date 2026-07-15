//USER ROUTES

const express = require("express");
const router = express.Router();

const flightController = require("../controllers/flightController");
const reservationController = require("../controllers/reservationController");
const userController = require("../controllers/profileController");

//Dashboard page route
router.get('/dashboard', flightController.showDashboard);

//Search page route
router.get('/search', flightController.showSearch);

//Booking page route
router.get('/booking', reservationController.showBooking);

//Reservations page route
router.get('/reservations', reservationController.showReservations);

//Profile page route
router.get('/profile', userController.showProfile);

module.exports = router;


