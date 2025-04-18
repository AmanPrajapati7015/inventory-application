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

// {
//   order_id: 29,
//   cust_id: 5,
//   date: 2025-04-18T13:19:13.109Z,
//   games: [ 20, 26, 23 ],
//   amount: '7256.00',
//   payment_method: 'online payment',
//   transaction_number: 'TXN1744982353',
//   payment_id: 30,
//   items: [
//     {
//       game_id: 20,
//       name: 'Grand Theft Auto IV',
//       logo_img: 'https://res.cloudinary.com/dmt9s5xlh/image/upload/v1714380902/ca2caef5-c861-453c-a342-18bf46b98687-GTAIV_logo.svg',
//       cover_img: 'https://res.cloudinary.com/dmt9s5xlh/image/upload/v1714380904/d9fc820b-223b-4266-9e68-3e1a42fa2bb2-GTAIV_hero.jpg',
//       price: '2333.00',
//       rating: '4.50',
//       pg_rating: null,
//       release_date: 2008-04-28T18:30:00.000Z,
//       publisher_id: 3,
//       publisher: 'Rockstar Games',
//       category: [Array]
//     },
//     {
//       game_id: 26,
//       name: 'Read Dead Redemption',
//       logo_img: 'https://res.cloudinary.com/dmt9s5xlh/image/upload/v1714380360/71420f6e-5821-4e18-9958-79b3220ae1ff-RDR_logo.svg',
//       cover_img: 'https://res.cloudinary.com/dmt9s5xlh/image/upload/v1714463482/614f1e87-ea5a-4da6-aaae-b86cd6e3ae0b-rdr.webp',
//       price: '3424.00',
//       rating: '4.70',
//       pg_rating: null,
//       release_date: 2010-05-17T18:30:00.000Z,
//       publisher_id: 2,
//       publisher: 'EA Games',
//       category: [Array]
//     },
//     {
//       game_id: 23,
//       name: 'L.A. Noire',
//       logo_img: 'https://res.cloudinary.com/dmt9s5xlh/image/upload/v1714381187/74ab4fb8-5dbb-4440-94d0-a8af848f6577-LANoire_logo.svg',
//       cover_img: 'https://res.cloudinary.com/dmt9s5xlh/image/upload/v1714381190/9fb9ac2d-1709-4370-a3e9-4c1c19503c10-LANoire_hero.jpg',
//       price: '1499.00',
//       rating: '3.90',
//       pg_rating: null,
//       release_date: 2011-05-16T18:30:00.000Z,
//       publisher_id: 1,
//       publisher: 'Ubisoft',
//       category: [Array]
//     }
//   ]
// }