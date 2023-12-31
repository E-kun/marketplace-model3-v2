const dotenv = require("dotenv");
dotenv.config();
const User = require('../models/user');
const Purchase = require('../models/purchase');

module.exports.renderAboutPage = (req, res) => {
    res.render('about');
}

module.exports.renderRegisterPage = (req, res) => {
    res.render('users/register');
}

module.exports.createUser = async(req, res) => {
    try{
        const {username, email, password, firstName, lastName, location} = req.body;
        const user = new User({email, username, firstName, lastName, location});
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
}

module.exports.renderLoginPage = (req, res) => {
    res.render('users/login');
}

module.exports.renderProfilePage = async (req, res) => {
    const user = req.session.passport;
    const userProfile = await User.findOne({ username: user.user });
    res.render('users/profile', { userProfile });
}

module.exports.renderPurchaseHistory = async (req, res) => {
    const user = req.session.passport;
    const purchases = await Purchase.find({ buyer: user.user });

    res.render('users/purchases', { purchases });
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/catalogue';
    // const redirectUrl = req.session.returnTo;
    delete req.session.returnTo;
    res.redirect(redirectUrl);
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

module.exports.renderAnnouncementPage = (req, res) => {
    res.render('users/announcements');
}
