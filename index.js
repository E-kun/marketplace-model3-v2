//Package definition references
const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const dotenv = require("dotenv");
dotenv.config();

//Local file definition references
const port = process.env.WEBAPPPORT;
const { dbConnect, pgConnect, mongoClient, pgPool } = require('./utils/db-connect');
const ExpressError = require('./utils/ExpressError');

//Route files
const resourceRoutes = require('./routes/resources');
const userRoutes = require('./routes/users');
// const cartRoutes = require('./routes/cart');

//Schema model files
const User = require('./models/user');
const Resource = require('./models/resource');

//Middleware
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(methodOverride('_method'));
// app.use(flash());

// app.use((req, res, next) => {
//     // console.log(req.session);
//     res.locals.session = req.session;
//     res.locals.currentUser = req.user;
//     res.locals.success = req.flash('success');
//     res.locals.error = req.flash('error');
//     next();
// });

dbConnect().catch(console.dir);
pgConnect();

//Express is using defined routes inside respective router objects.
app.use('/', userRoutes);
app.use('/catalogue', resourceRoutes);

app.get('/', async (req, res) => {
    res.render('home');
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Something has gone wrong.'
    res.status(statusCode).render('error', { err });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})