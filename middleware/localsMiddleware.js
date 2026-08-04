const User = require('../models/User');
 
module.exports = async function (req, res, next) {
    res.locals.sessionUserId = req.session.userId || null;
    res.locals.sessionRole = req.session.role || null;
 
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId).lean();
 
            res.locals.user = user;
            res.locals.profileIMG = req.session.profileIMG || '/imgs/users/default-pfp.jpg';
        } catch (err) {
            console.error(err);
            res.locals.user = null;
            res.locals.profileIMG = '/imgs/users/default-pfp.jpg';
        }
    } else {
        res.locals.user = null;
        res.locals.profileIMG = '/imgs/users/default-pfp.jpg';
    }
 
    next();
};
