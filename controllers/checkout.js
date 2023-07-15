const dotenv = require("dotenv");
dotenv.config();
const Cart = require('../models/cart');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Purchase = require('../models/purchase')

module.exports.renderPaymentForm = (req, res, next) => {
    const cart = new Cart(req.session.cart);
    const cartArray = cart.generateArray();
    totalPrice = cart.getTotalPrice();
    if(!req.session.cart){
        res.flash('error', 'A cart does not exist');
        return res.redirect('/catalogue');
    }
    res.render('checkout/payment', {resources: cartArray, totalPrice});
}

module.exports.getStripePubKey = (req, res) => {
    res.send({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
}

module.exports.renderPaymentSuccessPage = async (req, res) => {
    const cart = new Cart(req.session.cart);
    const cartArray = cart.generateArray();
    console.log(cart);
    if(!req.user){
      console.log("User is not logged in")
    } else{
      console.log("User is logged in")
      console.log(req.user)
      // const purchase = new Purchase();
      // purchase.resourceID = cart.items.resourceID;
      // purchase.name = cart.items.name;
      // purchase.price = cart.items.price;
      // purchase.file = cart.items.file;
      // purchase.buyer = req.user._id;
      
      // await purchase.save();
    }
    
    const purchases = [];
    
    totalPrice = cart.getTotalPrice();
    req.session.cart = null;
    res.render('checkout/complete', {resources: cartArray, totalPrice});
}

module.exports.renderPaymentFailedPage = (req, res) => {
    res.render('checkout/paymentFailed');
}

module.exports.sendToWebhook = async (req, res) => {
    let data, eventType;
  
    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
      let signature = req.headers['stripe-signature'];
      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`);
        return res.sendStatus(400);
      }
      data = event.data;
      eventType = event.type;
    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // we can retrieve the event data directly from the request body.
      data = req.body.data;
      eventType = req.body.type;
    }
  
    if (eventType === 'payment_intent.succeeded') {
      // Funds have been captured
      // Fulfill any orders, e-mail receipts, etc
      // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
      console.log('💰 Payment captured!');
    } else if (eventType === 'payment_intent.payment_failed') {
      console.log('❌ Payment failed.');
    }
    res.sendStatus(200);
  }

module.exports.createCheckoutSession = async (req, res) => {
    const cart = new Cart(req.session.cart);
    const cartArray = cart.generateArray();
    const session = await stripe.checkout.sessions.create({
        invoice_creation: {
          enabled: true,
        },
        line_items: cartArray,
        mode: 'payment',
        success_url: 'http://localhost:3180/checkout/payment/complete',
        cancel_url: 'http://localhost:3180/checkout/payment/failed',
      });
    res.redirect(303, session.url);
}