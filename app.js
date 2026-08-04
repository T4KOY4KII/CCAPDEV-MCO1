const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

const MONGO_URI = 'mongodb://TravelBuddyAdmin:ti4oAa77duhneNbm@ac-rjjnmom-shard-00-00.fbe5lgm.mongodb.net:27017,ac-rjjnmom-shard-00-01.fbe5lgm.mongodb.net:27017,ac-rjjnmom-shard-00-02.fbe5lgm.mongodb.net:27017/ccdevapDB?ssl=true&replicaSet=atlas-lbkg2t-shard-0&authSource=admin&appName=TravelBuddyCluster0';

//Connection to the database
mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("MongoDB Error: ", err));

//Serves static files 
app.use(express.static('public'));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Sessions - config lives in middleware/sessionMiddleware.js (stored in MongoDB via connect-mongo)
app.use(require('./middleware/sessionMiddleware')(MONGO_URI));

//Makes the logged-in user's info available to every template - see middleware/localsMiddleware.js
app.use(require('./middleware/localsMiddleware'));

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