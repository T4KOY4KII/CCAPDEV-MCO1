const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', required: true},
    status: {type: String, enum: ['active', 'deactivated'], default: 'active'},
    profileIMG: {type: String, default: "/imgs/user/default-pfp.jpg"}
}, { timestamps: true }); 

module.exports = mongoose.model('User', userSchema);