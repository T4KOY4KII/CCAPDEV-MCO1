const User = require('../models/User');
const Reservations = require('../models/Reservation');
const Flight = require('../models/Flight');

//User views details
const profileView = {
    title: 'TravelBuddy - Profile',
    layout: 'main',
    extraCSS: [
        '/css/profile.css'
    ],
    extraJS: [
        '/js/profile.js'
    ]
};

//Helper to validate passenger fields
function validatePassengerFields({ title, firstName, lastName, gender, passport, contact, email, dobMonth, dobDay, dobYear, address, city, country, nationality }) {
    if (!title || !firstName || !lastName || !gender || !passport || !contact || !email || !dobMonth || !dobDay || !dobYear || !address || !city || !country || !nationality) {
        return 'All passenger fields are required.';
    }
    const month = parseInt(dobMonth, 10);
    const day = parseInt(dobDay, 10);
    const year = parseInt(dobYear, 10);
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > new Date().getFullYear()) {
        return 'Please enter a valid date of birth.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (!/^\d{7,15}$/.test(contact)) return 'Please enter a valid contact number.';
    return null;
}

//Renders profile page
exports.showProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).lean();
        if (!user) return res.status(404).send('User not found');

        user.savedPassengers = user.savedPassengers || [];

        const initials = (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();

        res.render('user/profile', { ...profileView, user, initials, savedPassengersJSON: JSON.stringify(user.savedPassengers || []) });
    } catch (err) {
        console.error('Show profile error:', err);
        res.status(500).send('Something went wrong.');
    }
};


// Updates user profile
exports.updateProfile = async (req, res) => {
    try {
        const { title, firstName, lastName, contactCode, contactNumber, gender, dobMonth, dobDay, dobYear, email, address, city, country } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.params.id },
            { title, firstName, lastName, contactCode, contactNumber, gender, dobMonth, dobDay, dobYear, email, address, city, country },
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedUser) return res.status(404).json({ error: 'User not found' });

        res.json({ success: true, user: updatedUser });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};

// Saved passengers management
exports.addPassenger = async (req, res) => {
    try {
        const validationError = validatePassengerFields(req.body);
        if (validationError) return res.status(400).json({ error: validationError });

        const { title, firstName, lastName, gender, passport, contactCode, contact, email, dobMonth, dobDay, dobYear, address, city, country, nationality } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.savedPassengers.push({ title, firstName, lastName, gender, passport, contactCode, contact, email, dobMonth, dobDay, dobYear, address, city, country, nationality });
        await user.save();

        res.json({ success: true, savedPassengers: user.savedPassengers });
    } catch (err) {
        console.error('Add passenger error:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};

exports.updatePassenger = async (req, res) => {
    try {        
        const validationError = validatePassengerFields(req.body);
        if (validationError) return res.status(400).json({ error: validationError });

        const { title, firstName, lastName, gender, passport, contactCode, contact, email, dobMonth, dobDay, dobYear, address, city, country, nationality } = req.body;
        
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const passenger = user.savedPassengers.find(p => p._id.toString() === req.params.passengerId);
        if (!passenger) return res.status(404).json({ error: 'Passenger not found' });

        passenger.title = title;
        passenger.firstName = firstName;
        passenger.lastName = lastName;
        passenger.gender = gender;
        passenger.passport = passport;
        passenger.contactCode = contactCode;
        passenger.contact = contact;
        passenger.email = email;
        passenger.dobMonth = dobMonth;
        passenger.dobDay = dobDay;
        passenger.dobYear = dobYear;
        passenger.address = address;
        passenger.city = city;
        passenger.country = country;

        await user.save();

        res.json({ success: true, savedPassengers: user.savedPassengers });
    } catch (err) {
        console.error('Update passenger error:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};

exports.deletePassenger = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.savedPassengers = user.savedPassengers.filter(p => p._id.toString() !== req.params.passengerId);
        await user.save();

        res.json({ success: true, savedPassengers: user.savedPassengers });
    } catch (err) {
        console.error('Delete passenger error:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};