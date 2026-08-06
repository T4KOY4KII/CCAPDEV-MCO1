const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

//Authentication views details
const registerView = {
    title: 'TravelBuddy - Register',
    layout: 'auth-main'
};

const loginView = {
    title: 'TravelBuddy - Login',
    layout: 'auth-main'
};

//Renders register page
exports.showRegister = (req, res) => {

    res.render('auth/register', {
        ...registerView
    });

};

//Creates User
exports.register = async (req, res) => {

    const { firstName, lastName, email, password, confirmPassword } = req.body;

    try {

        //Validate
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return res.render('auth/register', {
                ...registerView,
                error: 'All fields are required.',
                firstName, lastName, email
            });
        }

        //CHecks for duplicate email
        const existing = await User.findOne({ email });
        if (existing) {
            return res.render('auth/register', {
                ...registerView,
                error: 'An account with that email already exists.',
                firstName, lastName, email
            });
        }

        //Check if password match
        if (password !== confirmPassword) {
            return res.render('auth/register', {
                ...registerView,
                error: 'Passwords do not match.',
                firstName, lastName, email
            });
        }

        //Minimum password length
        if (password.length < 6) {
            return res.render('auth/register', {
                ...registerView,
                error: 'Password must be at least 6 characters.',
                firstName, lastName, email
            });
        }

        //Save User  password gets hashed automatically by the pre-middleware in the User model
        const newUser = new User({ firstName, lastName, email, password });
        await newUser.save();

        await AuditLog.create({ username: email, userRole: 'user', activity: 'User Registration' });

        //Redirect to login page
        res.redirect('/login?registered=true');

    } catch (err) {
        console.error('Register error:', err);
        res.render('auth/register', {
            ...registerView,
            error: 'Something went wrong. Please try again.'
        });
    }
};

//Renders login page
exports.showLogin = (req, res) => {
    const success = req.query.registered
        ? 'Account created! You can now log in.'
        : null;

    res.render('auth/login', {
        ...loginView,
        success
    });
};

//Logs in user (verifies user credentials)
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {

        //Validate
        if (!email || !password) {
            return res.render('auth/login', {
                ...loginView,
                error: 'Email and password are required.',
                email
            });
        }

        //Finds User
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('auth/login', {
                ...loginView,
                error: 'Invalid email or password.',
                email
            });
        }

        //Checks user status
        if (user.status === "deactivated") {
            return res.render('auth/login', {
                ...loginView,
                error: 'Your account has been deactivated.',
                email
            });
        }

        //Checks password against the hashed value using bcrypt
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('auth/login', {
                ...loginView,
                error: 'Invalid email or password.',
                email
            });
        }

        //Implement sessions to store the successfully logged in user
        req.session.userId = user._id;
        req.session.role = user.role;
        req.session.firstName = user.firstName;
        req.session.lastName = user.lastName;
        req.session.profileIMG = user.profileIMG;
        req.session.email = user.email;

        await AuditLog.create({ username: user.email, userRole: user.role, activity: 'User Login' });

        if (user.role === "admin") {
            return res.redirect("/adminDashboard");
        }

        return res.redirect("/dashboard");

    } catch (err) {
        console.error('Login error:', err);
        res.render('auth/login', {
            ...loginView,
            error: 'Something went wrong. Please try again.'
        });
    }
};

//Logs out user
exports.logout = async (req, res) => {
    if (req.session.email) {
        await AuditLog.create({ username: req.session.email, userRole: req.session.role, activity: 'User Logout' });
    }
    req.session.destroy(function (err) {
        if (err) {
            console.error('Logout Error:', err);
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
};