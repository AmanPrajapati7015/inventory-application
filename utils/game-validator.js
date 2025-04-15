require('dotenv').config();
const { body} = require('express-validator');

categoryValidator= [
    body('category').isLength({min:1}).withMessage('select atleast one category'),
    body('rating').isFloat({min:1, max:5}).withMessage('rating should be between 1 to 5'),
    body('*').notEmpty().withMessage('you have missed a field'),
    body('password').equals(process.env.ADMIN_PASSWORD).withMessage('Wrong admin password')
]

module.exports = categoryValidator;