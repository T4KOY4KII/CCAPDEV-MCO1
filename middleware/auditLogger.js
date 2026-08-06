const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

async function createAuditLog(req, activity) {
    try {
        const currentUser = await User.findById(req.session.userId).lean();

        await AuditLog.create({
            username: currentUser
                ? `${currentUser.firstName} ${currentUser.lastName}`
                : "Unknown User",
            userRole: currentUser?.role || req.session.role || "user",
            activity
        });
    } catch (err) {
        console.error('Audit log error:', err);
    }
}

module.exports = createAuditLog;