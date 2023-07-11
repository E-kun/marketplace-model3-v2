const dotenv = require("dotenv");
dotenv.config();
const User = require('../models/user');
const Cart = require('../models/cart');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

function generateArray(cart) {
    const arr = [];
    for (let id in cart.items) {
        arr.push(cart.items[id]);
    }
    return arr;
};

module.exports.renderAboutPage = (req, res) => {
    res.render('about');
}

module.exports.renderRegisterPage = (req, res) => {
    res.render('users/register');
}

module.exports.createUser = async(req, res) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome. Please take the time to go through the teaching resource list.');
            res.redirect('/catalogue');
        })
    } catch(err){
        req.flash('error', err.message);
        res.redirect('register');
    }
    //Authentication setup required here. Flashing for testing purposes first.
    // req.flash('success', 'User created.');
    // res.redirect('/catalogue');
}

module.exports.renderLoginPage = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/catalogue';
    // const redirectUrl = req.session.returnTo;
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.renderProfilePage = (req, res) => {
    const userProfile = req.session.passport
    // res.send({userProfile})
    res.render('users/profile', {username: userProfile.user});
}

module.exports.renderAnnouncementPage = (req, res) => {
  res.render('users/announcements');
}

module.exports.renderCheckoutPage = (req, res, next) => {
    const currentCart = req.session.cart;
    const cartArray = generateArray(currentCart);
    if(!currentCart){
        res.flash('error', 'A cart does not exist');
        return res.redirect('/catalogue');
    }
    console.log(`Total Amount: $${currentCart.totalPrice}`);
    res.render('checkout/checkout', {resources: cartArray, totalPrice: currentCart.totalPrice});
}

module.exports.renderPaymentForm = (req, res, next) => {
    const currentCart = req.session.cart;
    const cartArray = generateArray(currentCart);
    if(!currentCart){
        res.flash('error', 'A cart does not exist');
        return res.redirect('/catalogue');
    }
    res.render('checkout/payment', {totalPrice: currentCart.totalPrice});
}

module.exports.getStripePubKey = (req, res) => {
    res.send({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
}

module.exports.createPaymentIntent = async (req, res) => {
    //Replace the amount key value with a variable extracting the amount from the price of product
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.session.cart.totalPrice*100,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        
    })
    res.send({ clientSecret: paymentIntent.client_secret })
}

module.exports.renderPaymentSuccessPage = (req, res) => {
    req.session.cart = {};
    res.render('checkout/complete');
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
    const currentCart = req.session.cart;
    const cartArray = generateArray(currentCart);
    const session = await stripe.checkout.sessions.create({
        invoice_creation: {
          enabled: true,
        },
        line_items: cartArray,
        mode: 'payment',
        success_url: 'http://localhost:3180/payment/complete',
        cancel_url: 'http://localhost:3180/payment/failed',
      });
    res.redirect(303, session.url);
}

module.exports.logout = (req, res, next) => {
    req.logout(req.user, err => {
        if(err) {
            return next(err);
        }
        req.flash('success', "Logout successful.");
        res.redirect('/catalogue')
    })
}

