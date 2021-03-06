// all passport configuration will go here
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const jwtSecret = require('./settings').jwtSecret;

passport.use('local-registration', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},
    function (req, email, password, done) {
        User.findOne({ 'local.email': email })
        .then(user => {
            if (user) {
                throw 'That email address is already in use.'
            }

            return User.findOne({ username: req.body.username });
        })
        .then(user => {
            if (user) {
                throw 'That username is already in use.'
            }

            // begin validation checks
            var errors = [];

            if (!req.body.fName) {
                errors.push('First name must not be left blank.');
            }

            if (!req.body.lName) {
                errors.push('Last name must not be left blank.');
            }

            if (!req.body.username) {
                errors.push('Username must not be left blank.');
            }

            if (errors.length > 0) {
                throw errors;
            }
        
            var newUser = new User();

            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);
            newUser.name.first = req.body.fName;
            newUser.name.last = req.body.lName;
            newUser.username = req.body.username;

            return newUser.save();
        })
        .then(() => {
            return done(null, true, {
                message: 'User created successfully!'
            });
        })
        .catch(err => {
            return done(null, false, {
                error: err
            });
        });
    }
));

passport.use('generate-token', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
    function(email, password, done) {
        User.findOne({ 'local.email': email })
            .then(user => {
                if (!user || !user.validPassword(password)) {
                    return done(null, false, {
                        error: 'Invalid username or password.'
                    });
                }

                jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '30d'}, function(err, token) {
                    if (err) {
                        return done(null, false, {
                            error: 'Something unexpected happened. Please try again.'
                        });
                    }
                    

                    var date = new Date(user.created_at);
                    var userCreated = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
                    return done(null, user, {
                        token: token,
                        user: {
                            id: user.id,
                            username: user.username,
                            email: user.local.email,
                            fName: user.name.first,
                            lName: user.name.last,
                            accountCreated: userCreated
                        }
                    });
                });
            })
            .catch(() => {
                return done(null, false, {
                    error: 'Something unexpected happened. Please try again.'
                });
            });
    }
));

module.exports = passport;