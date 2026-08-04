const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10; // Number of salt rounds for bcrypt

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
    role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
    status: { type: String, enum: ['active', 'deactivated'], default: 'active' },
    profileIMG: { type: String, default: "/imgs/users/default-pfp.jpg" },
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
    savedPassengers: [passengerSchema],
    notificationPrefs: {
        booking: { type: Boolean, default: true },
        schedule: { type: Boolean, default: false },
        checkin: { type: Boolean, default: true },
        travel: { type: Boolean, default: true },
        promo: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
    }
}, { timestamps: true });

//Password hashing middleware so password saves before document is saved
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

//Method to compare a given password with the database hash
userSchema.method('comparePassword', async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
});

module.exports = mongoose.model('User', userSchema);