const express = require('express');
const router = express.Router();
const checkout = require('../controllers/checkout');
const catchAsync = require('../utils/catchAsync');

router.route('/payment')
    .get(checkout.renderPaymentForm);

router.route('/config')
    .get(checkout.getStripePubKey);
    
router.route('/create-checkout-session')
    .post(checkout.createCheckoutSession);

router.route('/payment/complete')
    .get(checkout.renderPaymentSuccessPage);

router.route('/payment/failed')
    .get(checkout.renderPaymentFailedPage);

    // Expose a endpoint as a webhook handler for asynchronous events.
    // Configure your webhook in the stripe developer dashboard
    // https://dashboard.stripe.com/test/webhooks
router.route('/webhook')
    .post(checkout.sendToWebhook);

module.exports = router;