require('dotenv').config();
const { body} = require('express-validator');

categoryValidator= [
    body('disc').isLength({min:10}).withMessage('description can\'t have lenght less than 10 characters'),
    body('category').isLength({min:1}).withMessage('select atleast one category'),
    body('rating').isFloat({min:1, max:10}).withMessage('rating should be between 1 to 10'),
    body('*').notEmpty().withMessage('you have missed a field'),
    body('password').equals(process.env.ADMIN_PASSWORD).withMessage('Wrong admin password')
]

module.exports = categoryValidator;