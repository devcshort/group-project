const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users');
const Authorize = require('../helpers/authorize');

// create a new user
router.post('/users', (req, res, next) =>
UserController.createNewUser(req, res, next));

// update a user
router.put('/users', (req, res, next) =>
UserController.updateUser(req, res, next));

// delete a user
router.delete('/users/:id', Authorize, (req, res, next) =>
UserController.deleteUser(req, res, next));

module.exports = router;