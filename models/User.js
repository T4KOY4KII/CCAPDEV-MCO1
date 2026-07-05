const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['passenger', 'admin'], default: 'passenger', required: true},
    status: {type: String, enum: ['active', 'deactivated'], default: 'active'}
}, { timestamps: true }); // not the complete schema for users - just a placeholder for now

module.exports = mongoose.model('User', userSchema);