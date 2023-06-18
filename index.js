//Package definition references
const express = require('express');
const app = express();
const dotenv = require("dotenv");
const path = require('path');
const ejsMate = require('ejs-mate');
dotenv.config();

//Local file definition references
const { dbConnect, pgConnect, mongoClient, pgPool } = require('./utils/db-connect');
const port = process.env.WEBAPPPORT;

//Schema model files
const User = require('./models/user');
const Resource = require('./models/resource');

app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

dbConnect().catch(console.dir);
pgConnect();

app.get('/', async (req, res, next) => {
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