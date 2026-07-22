const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const User = require('./models/User');

//Connection to the database
mongoose.connect('mongodb://TravelBuddyAdmin:ti4oAa77duhneNbm@ac-rjjnmom-shard-00-00.fbe5lgm.mongodb.net:27017,ac-rjjnmom-shard-00-01.fbe5lgm.mongodb.net:27017,ac-rjjnmom-shard-00-02.fbe5lgm.mongodb.net:27017/ccdevapDB?ssl=true&replicaSet=atlas-lbkg2t-shard-0&authSource=admin&appName=TravelBuddyCluster0')
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("MongoDB Error: ", err));

//Serves static files 
app.use(express.static('public'));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'travelbuddy-dev-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 2, httpOnly: true }
}));

// makes the logged-in user's ID available to EVERY template automatically,
// including partials like the navbar, without each controller passing it manually
app.use( async (req, res, next) => {
    res.locals.sessionUserId = req.session.userId || null;
    res.locals.sessionRole = req.session.role || null;

    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId).lean();

            res.locals.user = user;
            res.locals.profileIMG = req.session.profileIMG || '/imgs/users/default-pfp.jpg';
        } catch (err) {
            console.error(err);
            res.locals.user = null;
            res.locals.profileIMG = '/imgs/users/default-pfp.jpg';
        }
    } else {
        res.locals.user = null;
        res.locals.profileIMG = '/imgs/users/default-pfp.jpg';
    }

    next();
});

//Handlebars setup
app.engine("hbs", exphbs.engine({
    extname: 'hbs',
    helpers: {
        eq: function (a, b) { //small helper function to compare two values in handlebars templates because of the glitch ?? 
            return a === b; // error was asking for this specific helper function
        }
    }
}));
app.set("view engine", "hbs");
app.set("views", "./views");

//Express Routes
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/userRoutes'));
app.use('/', require('./routes/adminRoutes'));

//Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000')
});