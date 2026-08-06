//ADMIN ROUTES

const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

//Dashboard page route
router.get('/adminDashboard', adminController.showAdminDashboard);

//Flights management page route
router.get('/adminFlights', adminController.showFlightsMgmt);

//Flights AJAX CRUD API routes
router.get('/api/admin/flights', adminController.getFlightsAPI);
router.post('/api/admin/flights', adminController.createFlight);
router.put('/api/admin/flights/:id', adminController.updateFlight);
router.delete('/api/admin/flights/:id', adminController.deleteFlight);

//Reservations management page route
router.get('/adminReservations', adminController.showReservationsMgmt);

//Reservations AJAX API routes
router.get('/api/admin/reservations', adminController.getReservationsAPI);
router.put('/api/admin/reservations/:id', adminController.updateReservationStatus);
router.delete('/api/admin/reservations/:id', adminController.deleteReservation);

//User management page route
router.get('/adminUsers', adminController.showUserMgmt);

//Users AJAX API routes
router.get('/api/admin/users', adminController.getUsersAPI);
router.put('/api/admin/users/:id/status', adminController.toggleUserStatus);
//Audit logs page route
router.get('/adminAuditLogs', adminController.showAuditLogs);

module.exports = router;