const ExpressError = require('./utils/ExpressError');
const { resourceSchema } = require('./schemas.js');
const Resource = require('./models/resource');

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        console.log(req.path, req.originalUrl);
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
    
}

module.exports.validateResource = (req, res, next) => {
    const { error } = resourceSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}