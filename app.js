require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const User = require('./models/User');

//Connection to the database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("MongoDB Error: ", err));

//Serves static files 
app.use(express.static('public'));

//Handlebars setup
app.engine("hbs", exphbs.engine({ extname: 'hbs' }));
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