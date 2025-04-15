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
    let pub_id = +game_rows[0].publisher_id;
    const { rows: publisher_rows} = await pool.query('SELECT * FROM publisher WHERE publisher_id = $1', [pub_id])
    
    const { rows: category } = await pool.query(
        `SELECT categories.cat_id as id, categories.cat_name as name FROM games 
         JOIN game_cat ON game_cat.game_id = games.game_id
         JOIN categories ON game_cat.cat_id = categories.cat_id
         WHERE games.game_id = $1`,
        [id]
    );

    let game = { ...game_rows[0], publisher:publisher_rows[0].pub_name, category };
    return game;
}

// Add a new game
async function addGame({ name, category, price, stock, logo_img_url, cover_img_url, publisher_id, release_date, rating, pg_rating }) {
    // Insert the game
    let query = `
        INSERT INTO games 
            (name, logo_img, cover_img, price, rating, pg_rating, release_date, publisher_id) 
        VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING game_id`;
    
    let values = [name, logo_img_url, cover_img_url, price, rating, pg_rating, release_date, publisher_id];
    const { rows } = await pool.query(query, values);
    const game_id = rows[0].game_id;

    // Insert category mappings
    for (let category_id of category) {
        await pool.query('INSERT INTO game_category (game_id, category_id) VALUES ($1, $2)', [game_id, category_id]);
    }

    return game_id;
}

// Get a category and its games
async function getCategoryById(id) {
    const { rows: category_rows } = await pool.query('SELECT cat_id as id, description as disc, cat_name as name, imgurl FROM categories WHERE cat_id = $1', [id]);
    console.log(category_rows);
    
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
    await pool.query(
        'INSERT INTO category (name, imgurl, disc) VALUES ($1, $2, $3)',
        [name, img_url, disc]
    );

    const { rows: selectRows } = await pool.query(
        'SELECT id FROM category WHERE name = $1 AND disc = $2',
        [name, disc]
    );

    return selectRows[0].id;
}

module.exports = {
    getGames,
    getGameById,
    addGame,
    getCategoryById,
    getCategories,
    addCategory,
};