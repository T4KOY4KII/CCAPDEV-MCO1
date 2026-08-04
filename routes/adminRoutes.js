//ADMIN ROUTES

const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { requireAdmin, requireAdminAPI } = require("../middleware/authMiddleware");

//Dashboard page route
router.get('/adminDashboard', requireAdmin, adminController.showAdminDashboard);

//Flights management page route
router.get('/adminFlights', requireAdmin, adminController.showFlightsMgmt);

//Flights AJAX CRUD API routes
router.get('/api/admin/flights', requireAdmin, adminController.getFlightsAPI);
router.post('/api/admin/flights', requireAdminAPI, adminController.createFlight);
router.put('/api/admin/flights/:id', requireAdminAPI, adminController.updateFlight);
router.delete('/api/admin/flights/:id', requireAdminAPI, adminController.deleteFlight);

//Reservations management page route
router.get('/adminReservations', requireAdmin, adminController.showReservationsMgmt);

//Reservations AJAX API routes
router.get('/api/admin/reservations', requireAdmin, adminController.getReservationsAPI);
router.put('/api/admin/reservations/:id', requireAdminAPI, adminController.updateReservationStatus);
router.delete('/api/admin/reservations/:id', requireAdminAPI, adminController.deleteReservation);

//User management page route
router.get('/adminUsers', requireAdmin, adminController.showUserMgmt);

//Users AJAX API routes
router.get('/api/admin/users', requireAdmin, adminController.getUsersAPI);
router.put('/api/admin/users/:id/status', requireAdminAPI, adminController.toggleUserStatus);

module.exports = router;