const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
    title: String,
    firstName: String,
    lastName: String,
    gender: String,
    nationality: { type: String, default: 'Filipino' },
    passport: String,
    contactCode: { type: String, default: '+63' },
    contact: String,
    email: String,
    dobMonth: String,
    dobDay: String,
    dobYear: String,
    address: String,
    city: String,
    country: String
});

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', required: true},
    status: {type: String, enum: ['active', 'deactivated'], default: 'active'},
    profileIMG: {type: String, default: "/imgs/users/default-pfp.jpg"},
    title: { type: String },
    contactCode: { type: String, default: '+63' },
    contactNumber: { type: String },
    gender: { type: String },
    dobMonth: { type: String },
    dobDay: { type: String },
    dobYear: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    savedPassengers: [passengerSchema]
}, { timestamps: true }); 

module.exports = mongoose.model('User', userSchema);