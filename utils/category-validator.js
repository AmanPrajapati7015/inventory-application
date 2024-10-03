require('dotenv').config();
const { body} = require('express-validator');

newGameValidator= [
    body('disc').isLength({min:10}).withMessage('description can\'t have lenght less than 10 characters'),
    body('*').notEmpty().withMessage('you have missed a field'),
    body('password').equals(process.env.ADMIN_PASSWORD).withMessage('Wrong admin password')
]

module.exports = newGameValidator;