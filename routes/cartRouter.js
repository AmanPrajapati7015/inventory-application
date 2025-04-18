const express = require('express');
const router = express.Router();
const {getGameById, placeOrder} = require('../db/fucntions')


// Middleware to ensure cart exists in session
function ensureCart(req, res, next) {
    if (!req.session.cart) {
        req.session.cart = [];
    }
    next();
}


// View cart contents
router.get('/', ensureCart, async (req, res) => {
    const games = await Promise.all(
        req.session.cart.map(async (game_id) => {
            const game = await getGameById(game_id);
            return game;
        })
    )

    res.render('cart', { cart: games });
});


// Add item to cart
router.post('/add', ensureCart, (req, res, next) => {
    const { game_id } = req.body;
    if (!game_id ) {
        return next(new Error('please select a valid game to add in cart'));
    }

    const existing = req.session.cart.find(id => id === game_id);
    if (!existing) {
        req.session.cart.push(game_id);
    }
    
    res.redirect('/cart');
});


// Remove item from cart
router.post('/remove', ensureCart, (req, res) => {
    const { game_id } = req.body;
    if (!game_id)
        return next(new Error('This game is not present in cart'));
    
    req.session.cart = req.session.cart.filter(id => id != game_id);
    res.redirect('/cart');
});

// Place order (checkout)
router.post('/checkout', ensureCart, async (req, res) => {
    const customerId = req.session.user.cust_id; 
    const cart = req.session.cart;

    const result  =  await placeOrder(customerId, cart, "online payment");
    let order = result[0].place_order;
    
    let res_str = `Order placed successfully for user: ${customerId} with id: ${order.order_id}, total amound: ${order.total_amount}, tanx_number: ${order.transaction_number}, payement_id : ${order.payment_id}`
    console.log(res_str);
    
    req.session.cart = [];
    res.render('order-success', order);

});

module.exports = router;