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

module.exports = mongoose.model('User', userSchema);

//Updates the user's notification preferences
exports.updateNotifications = async (req, res) => {
    try {
        const { booking, schedule, checkin, travel, promo, sms } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.params.id },
            { notificationPrefs: { booking: !!booking, schedule: !!schedule, checkin: !!checkin, travel: !!travel, promo: !!promo, sms: !!sms } },
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedUser) return res.status(404).json({ error: 'User not found' });

        res.json({ success: true, notificationPrefs: updatedUser.notificationPrefs });
    } catch (err) {
        console.error('Update notifications error:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};