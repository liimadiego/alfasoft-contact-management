const express = require('express');
const router = express.Router();
const { authValidation } = require('../middleware/validation.js')
const { register, login } = require('../controller/auth.controller.js')

router.post('/login', authValidation, login);
router.post('/register', authValidation, register);

module.exports = router;