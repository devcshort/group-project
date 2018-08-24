const UserController = new Object();
const passport = require('passport');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/settings').jwtSecret;
const extractJwt = require('../helpers/extract');

require('../config/passport');

/*
* If we have extra time near the end of the project
* Go back and add login attempt tracking
* Lock an account after too many attempts were made
*/
UserController.createNewUser = function(req, res, next) {
    passport.authenticate('local-registration', function(err, user, info) {
        if (err) {
            return res.status(500).json(info);
        }
        if (!user) {
            return res.status(400).json(info)
        }
        return res.status(201).json(info);
    })(req, res, next);
}

UserController.updateUser = function(req, res, next) {
    jwt.verify(extractJwt(req), jwtSecret, function(err, decoded) {
        if (err) {
            return res.status(500).json({
                error: 'An unknown error occurred'
            });
        } else {
            User.findById(decoded.id)
            .then(user => {
                if (!user) {
                    return res.status(404).json({
                        error: 'Unable to find a user with given information.'
                    })
                }

                // start saving updated user details
                if (req.body.email) {
                    user.local.email = req.body.email;
                }
                if (req.body.username) {
                    user.username = req.body.username;
                }
                if (req.body.password && req.body.password.length > 5) {
                    user.local.password = user.generateHash(req.body.password);
                }

                user.save()
                    .then(data => {
                        return res.status(204).json({
                            success: 'User updated successfully!'
                        });
                    })
                    .catch(err => {
                        return res.status(500).json({
                            error: 'Something unexpected happened.'
                        });
                    })    
            })
            .catch(err => {
                return res.status(500).json({
                    error: 'Something unexpected happened.'
                })
            })
        }
    });
}

UserController.deleteUser = function(req, res, next) {
    User.findById(req.params.id)
        .then(user => {
            user.remove()
                .then(data => {
                    return res.status(204).json({
                        success: 'User deleted successfully!'
                    });
                })
                .catch(err => {
                    return res.status(500).json({
                        error: 'Something unexpected happened.'
                    });
                })
        })
        .catch(err => {
            return res.status(500).json({
                error: 'Something unexpected happened.'
            });
        })
}

module.exports = UserController;