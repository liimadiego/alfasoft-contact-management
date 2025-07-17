const { body, validationResult } = require('express-validator');

const contactValidation = [
    body('name').isLength({ min: 6 }).withMessage('Name must be at least 6 characters long'),
    body('contact').isLength({ min: 9, max: 9 }).withMessage('Contact must be exactly 9 digits'),
    body('email').isEmail().withMessage('Must be a valid email address')
];

const authValidation = [
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]

module.exports = {
    contactValidation,
    authValidation
}