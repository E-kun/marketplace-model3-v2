const MongoStore = require('connect-mongo');
const dotenv = require("dotenv");
dotenv.config();

module.exports.sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGOCONNECTIONURI,
        ttl: 2 * 60 * 60,
        autoRemove: 'native'
    })
}