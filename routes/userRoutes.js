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
router.get('/search/results', flightController.searchFlights); 

// Flight details
router.get('/flight/:id', flightController.showFlightDetails); 

//Booking page route
router.get('/booking', reservationController.showBooking);

//Reservations page routes
router.get('/reservations', reservationController.showReservations);
router.put('/reservations/:id/seat', reservationController.updateSeat);
router.put('/reservations/:id/cancel', reservationController.cancelReservation);

//Profile page route
router.get('/profile/:id', userController.showProfile);
router.put('/profile/:id', userController.updateProfile);

// Saved passengers page route
router.post('/profile/:id/passengers', userController.addPassenger);
router.put('/profile/:id/passengers/:passengerId', userController.updatePassenger);
router.delete('/profile/:id/passengers/:passengerId', userController.deletePassenger);

//Notification preferences route
router.put('/profile/:id/notifications', userController.updateNotifications);

module.exports = router;


