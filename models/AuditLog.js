const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    username: { type: String, required: true },
    userRole: { type: String, required: true },
    activity: { type: String, required: true }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
