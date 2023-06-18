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

router.route('/new-announcement')
    .get(isLoggedIn, users.renderAnnouncementPage);
    // .get(users.renderAnnouncementPage);

router.route('/checkout')
    .get(users.renderCheckoutPage);
    // .post(users.createCheckoutSession);

router.route('/payment')
    .get(users.renderPaymentForm);

router.route('/config')
    .get(users.getStripePubKey);
    
router.route('/create-payment-intent')
    .post(users.createPaymentIntent);

router.route('/payment/complete')
    .get(users.renderPaymentSuccessPage);
    
    // Expose a endpoint as a webhook handler for asynchronous events.
    // Configure your webhook in the stripe developer dashboard
    // https://dashboard.stripe.com/test/webhooks
router.route('/webhook')
    .post(users.sendToWebhook);



module.exports = router;