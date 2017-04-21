var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

router.get('/register', function(req, res) {
  res.render('register');
});
router.get('/login', function(req, res) {
  res.render('login');
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user){
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'Wrong user'})
      }
      User.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        } else {
          return done(null, false, {message: 'Wrong password'});
        }
      })
    })
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect: '/', failureRedirect: '/users/login', failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.post('/register', function(req, res){
  var name = req.body.name;
  var userName = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var rePassword = req.body.repassword;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('repassword', 'Passwords does not match').equals(req.body.password);
  var errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors: errors
    })
  } else {
    var newUser = new User({
      username: userName,
      password: password,
      email: email,
      name: name
    });

    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });
    req.flash('success_msg', 'You are successfully registered, now you can login');
    res.redirect('/users/login')

  }
});

router.get('/logout', function(req,res){
  req.logout();
  req.flash('success_msg', 'Logged out. Miss us already? Sign in below');
  res.redirect('/users/login');
});


module.exports = router;
