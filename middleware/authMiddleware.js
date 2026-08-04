//Verify that the user is authenticated 
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

//Verify that the user is authenticated (JSON version)
function requireAuthAPI(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'You must be logged in to do that.' });
    }
    next();
}

//Verify if user is an admin
function requireAdmin(req, res, next) {

    //Must be logged in first
    if (!req.session.userId) {
        return res.redirect('/login');

    }
    //Checks if the user has an admin role
    if (req.session.role !== 'admin') {
        return res.status(403).send('Access Denied: This page is for administrators only') //403 Forbidden
    }
    next();

}
 
//Verify if user is an admin (JSON version)
function requireAdminAPI(req, res, next) {
 
    //Must be logged in first
    if (!req.session.userId) {
        return res.status(401).json({ error: 'You must be logged in to do that.' });
    }
    //Checks if the user has an admin role
    if (req.session.role !== 'admin') {
        return res.status(403).json({ error: 'Access Denied: This page is for administrators only' });
    }
    next();
}
 
module.exports = { requireAuth, requireAdmin, requireAuthAPI, requireAdminAPI };