const dotenv = require("dotenv");
dotenv.config();
const User = require('../models/user');

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

module.exports.renderProfilePage = (req, res) => {
    const userProfile = req.session.passport
    // res.send({userProfile})
    res.render('users/profile', {username: userProfile.user});
}

module.exports.renderPurchaseHistory = (req, res) => {
    // res.send({userProfile})
    res.render('users/purchases');
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
