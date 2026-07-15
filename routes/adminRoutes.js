//ADMIN ROUTES

const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

//Dashboard page route
router.get('/adminDashboard', adminController.showAdminDashboard);

//Flights management page route
router.get('/adminFlights', adminController.showFlightsMgmt);

//Reservations management page route
router.get('/adminReservations', adminController.showReservationsMgmt);

//User management page route
router.get('/adminUsers', adminController.showUserMgmt);

module.exports = router;