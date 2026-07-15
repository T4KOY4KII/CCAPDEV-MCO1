//AUTHENTICATION ROUTES

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

router.get("/", (req, res) => {
    res.redirect("/login");
});

//Login page route
router.get("/login", authController.showLogin);
router.post("/login", authController.login);

//Register page route
router.get("/register", authController.showRegister);
router.post("/register", authController.register);

module.exports = router;