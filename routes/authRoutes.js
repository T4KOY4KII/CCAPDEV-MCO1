//AUTHENTICATION ROUTES

const express = require("express");
const router = express.Router();

//Login page route
router.get('/', (req, res) => {
    res.render('auth/login', {
        title: 'TravelBuddy - Login',
        layout: 'auth-main'
    });
});

//Register page route
router.get('/register', (req, res) => {
    res.render('auth/register', {
        title: 'TravelBuddy - Register',
        layout: 'auth-main'
    });
})

module.exports = router;