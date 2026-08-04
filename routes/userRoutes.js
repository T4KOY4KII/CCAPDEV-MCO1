//USER ROUTES

const express = require("express");
const router = express.Router();

const flightController = require("../controllers/flightController");
const reservationController = require("../controllers/reservationController");
const userController = require("../controllers/profileController");
const { requireAuth, requireAuthAPI } = require("../middleware/authMiddleware");

//Dashboard page route
router.get('/dashboard', requireAuth, flightController.showDashboard);

//Search page route
router.get('/search', requireAuth, flightController.showSearch);
router.get('/search/results', requireAuth, flightController.searchFlights); 

// Flight details
router.get('/flight/:id', requireAuth, flightController.showFlightDetails); 

//Booking page route
router.get('/booking/:flightId', requireAuth, reservationController.showBooking);
router.post('/booking/:flightId', requireAuthAPI, reservationController.createBooking); //protected

//Reservations page routes
router.get('/reservations', requireAuth, reservationController.showReservations);
router.put('/reservations/:id/seat', requireAuthAPI, reservationController.updateSeat); //protected
router.put('/reservations/:id/cancel', requireAuthAPI, reservationController.cancelReservation); //protected

//Profile page route
router.get('/profile/:id', requireAuth, userController.showProfile);
router.put('/profile/:id', requireAuthAPI, userController.updateProfile);

// Saved passengers page route
router.post('/profile/:id/passengers', requireAuthAPI, userController.addPassenger); //protected
router.put('/profile/:id/passengers/:passengerId', requireAuthAPI, userController.updatePassenger); //protected
router.delete('/profile/:id/passengers/:passengerId', requireAuthAPI, userController.deletePassenger); //protected

//Notification preferences route
router.put('/profile/:id/notifications', requireAuthAPI, userController.updateNotifications); //protected

module.exports = router;


