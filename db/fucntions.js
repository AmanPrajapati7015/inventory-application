require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.CONNECTION_STRING });

// Get all games (basic info)
async function getGames() {
    const { rows } = await pool.query(
        'SELECT game_id, name, logo_img AS logo_img_url, cover_img AS cover_img_url FROM games'
    );
    return rows;
}

// Get a game by ID (full info + categories)
async function getGameById(id) {
    const { rows: game_rows } = await pool.query('SELECT * FROM games WHERE game_id = $1', [id]);

    let pub_id = 1;
    if (game_rows[0])
        pub_id = game_rows[0].publisher_id

    const { rows: publisher_rows } = await pool.query('SELECT * FROM publisher WHERE publisher_id = $1', [pub_id])

    const { rows: category } = await pool.query(
        `SELECT categories.cat_id as id, categories.cat_name as name FROM games 
         JOIN game_cat ON game_cat.game_id = games.game_id
         JOIN categories ON game_cat.cat_id = categories.cat_id
         WHERE games.game_id = $1`,
        [id]
    );

    let game = { ...game_rows[0], publisher: publisher_rows[0].pub_name, category };
    return game;
}

// Add a new game
async function addGame({ name, publisher, category, price, logo_img_url, cover_img_url, release_date, rating }) {

    let query = `
        INSERT INTO games 
            (name, logo_img, cover_img, price, rating, release_date, publisher_id) 
        VALUES 
            ($1, $2, $3, $4, $5, $6, $7)
        RETURNING game_id`;

    let values = [name, logo_img_url, cover_img_url, price, rating, release_date, publisher];


    const { rows } = await pool.query(query, values);
    const game_id = rows[0].game_id;

    console.log(game_id);

    // // Insert category mappings
    for (let cat_id of category) {
        await pool.query('INSERT INTO game_cat (game_id, cat_id) VALUES ($1, $2)', [game_id, cat_id]);
    }

    return game_id;
}

// Get a category and its games
async function getCategoryById(id) {
    const { rows: category_rows } = await pool.query('SELECT cat_id as id, description as disc, cat_name as name, imgurl FROM categories WHERE cat_id = $1', [id]);


    const { rows: games } = await pool.query(
        `SELECT games.game_id AS id, games.name, games.logo_img AS logo_img_url FROM games 
         JOIN game_cat ON game_cat.game_id = games.game_id
         JOIN categories ON game_cat.cat_id = categories.cat_id
         WHERE categories.cat_id = $1`,
        [id]
    );

    let category = { ...category_rows[0], games };
    return category;
}

// Get all categories
async function getCategories() {
    const { rows } = await pool.query('SELECT cat_id as id, cat_name as name, imgurl FROM categories');
    return rows;
}

// Add new category
async function addCategory({ name, disc, img_url }) {
    const { rows: cat } = await pool.query(
        'INSERT INTO categories (cat_name, imgurl, description) VALUES ($1, $2, $3) returning cat_id',
        [name, img_url, disc]
    );

    return cat[0].cat_id;
}

async function getPublishers() {
    const { rows } = await pool.query('SELECT  publisher_id, pub_name  FROM publisher');
    return rows;
}

async function placeOrder(user_id, game_ids, payment_method) {
    const query = 'SELECT place_order($1, $2, $3)';
    const result = await pool.query(query, [user_id, game_ids, payment_method]);
    return result.rows;
}


async function getOrderDetails(order_id) {
    const res = await pool.query(
        `SELECT 
            o.order_id, o.cust_id, o.date,
            ARRAY_AGG(go.game_id) as games, 
            o.amount, p.payment_method, p.transaction_number, p.payment_id
        FROM "order" o 
        JOIN game_order go ON o.order_id = go.order_id
        JOIN payment p ON p.payment_id=o.payment_id
        WHERE o.order_id = $1
        GROUP BY o.order_id, o.cust_id, o.date, o.amount, p.payment_method, p.transaction_number, p.payment_id`,
        [order_id]
    );
    return res.rows[0];
}

async function getCustomerOrders(cust_id) {
    const res = await pool.query(
        `SELECT order_id FROM "order" WHERE cust_id = $1`,
        [cust_id]
    );

    let orders = [];
    for (let row of res.rows) {
        const orderDetails = await getOrderDetails(row.order_id);
        orders.push(orderDetails);
    }

    return orders;
}
 








module.exports = {
    getGames,
    getGameById,
    addGame,
    getCategoryById,
    getCategories,
    addCategory,
    getPublishers,
    placeOrder,
    getCustomerOrders,
    getOrderDetails,
};