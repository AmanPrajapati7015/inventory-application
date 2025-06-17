const express = require('express');
const router = express.Router();
const { getCustomerOrders, getOrderDetails, getGameById } = require('../db/fucntions'); 

// GET /orders - list of user's orders
router.get('/', async (req, res, next) => {
    const userId = req.session.user.cust_id;
    
    try {
        const orders = await getCustomerOrders(userId);
        res.render('orders', { orders });
    } catch (err) {
        next(new Error("error while fetching the orders"));
    }
});

// GET /order/:id - single order detail page
router.get('/:id', async (req, res, next) => {
    const orderId = req.params.id;
    const custID = req.session.user.cust_id;
    try {
        const order = await getOrderDetails(orderId);
        
        if (order==undefined) {
            next (new Error("This order-id is invalid"));
        }
        else if (order.cust_id != custID) {
            next(new Error("This order is not your"));
        }
        
        let game_ids = order.games;
        let games = await Promise.all(
            game_ids.map(async id=> await getGameById(id))
        )
        
        order.items = games;
        console.log(order);
        
        res.render('order-details', {order});

    } catch (err) {
        next (new Error(err.message));
    }
});

module.exports = router;
