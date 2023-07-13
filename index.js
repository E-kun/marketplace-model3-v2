//Package definition references
const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const dotenv = require("dotenv");
dotenv.config();

const passport = require('passport');
const LocalStrategy = require('passport-local');

//Local file definition references
const port = process.env.WEBAPPPORT;
const { dbConnect, pgConnect} = require('./utils/db-connect');
const ExpressError = require('./utils/ExpressError');
const { sessionConfig } = require('./utils/sessionConfig');

//Route files
const resourceRoutes = require('./routes/resources');
const userRoutes = require('./routes/users');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout')

//Schema model files
const User = require('./models/user');

dbConnect();
pgConnect();

//Middleware
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log(req.session);
    res.locals.session = req.session;
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

//Express is using defined routes inside respective router objects.
app.use('/', userRoutes);
app.use('/cart', cartRoutes);
app.use('/catalogue', resourceRoutes);
app.use('/checkout', checkoutRoutes)

app.get('/', async (req, res) => {
    res.render('home');
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Something has gone wrong.'
    res.status(statusCode).render('error', { err });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})