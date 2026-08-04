//Verify that the user is authenticated 
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

//Verification that the user has the required role before accessing protected routes

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

//Verify if user is a passenger
function requirePassenger(req, res, next) {
    
        //Must be logged in first
        if (!req.session.userId) {
            return res.redirect('/login');

        }
        //Checks if the user has a passenger  role
        if (req.session.role !== 'user') {
            return res.status(403).send('Access Denied: This page is for passengers only') //403 Forbidden
        }
        next();
   
}

module.exports = { requireAuth, requireAdmin, requirePassenger};