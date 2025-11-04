const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const { storeReturnTo } = require('../middleware/auth');

// Register form
router.get('/register', (req, res) => {
    res.render('users/register', { pageTitle: 'Register' });
});

// Register user
router.post('/register', async (req, res, next) => {
    try {
        const { email, username, password, firstName, lastName } = req.body;
        const user = new User({ email, username, firstName, lastName });
        const registeredUser = await User.register(user, password);
        
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Wanderlust!');
            res.redirect('/listings');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
});

// Login form
router.get('/login', (req, res) => {
    res.render('users/login', { pageTitle: 'Login' });
});

// Login user
router.post('/login', storeReturnTo, passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/listings';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

// Logout
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) return next(err);
        req.flash('success', 'Goodbye!');
        res.redirect('/listings');
    });
});

module.exports = router;
