const session = require('express-session');
const { MongoStore } = require('connect-mongo');

//centralizes session configs for convenience
module.exports = function (mongoUri) {
    return session({
        secret: 'travelbuddy-dev-secret',
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({ mongoUrl: mongoUri }),
        cookie: { maxAge: 1000 * 60 * 60 * 2, httpOnly: true }
    });
};