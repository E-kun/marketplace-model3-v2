const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { isLoggedIn } = require('../middleware');

router.get('/about', users.renderAboutPage);

//User Related
router.route('/register')
    .get(users.renderRegisterPage)
    .post(catchAsync(users.createUser));

router.route('/login')
    .get(users.renderLoginPage)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

router.get('/logout', users.logout);

router.route('/profile')
    .get(isLoggedIn, users.renderProfilePage);
    // .get(users.renderProfilePage);

router.route('/purchase-history')
    .get(isLoggedIn, users.renderPurchaseHistory);

router.route('/new-announcement')
    .get(isLoggedIn, users.renderAnnouncementPage);
    // .get(users.renderAnnouncementPage);
    
module.exports = router;