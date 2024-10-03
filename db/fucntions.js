require('dotenv').config();
const {Pool} = require('pg');

const pool = new Pool({connectionString: process.env.CONNECTION_STRING});


async function getGames() {
    const {rows} = await pool.query('SELECT id, name, logo_img_url,cover_img_url  from items');
    return rows;
}

async function getGameById(id) {
    const {rows : game_rows} = await pool.query('SELECT * FROM items where id=$1',[id]);

    const {rows : category} = await pool.query(
        `select category.id, category.name from items 
        join game_category ON game_category.game_id = items.id
        join category on game_category.category_id = category.id
        where items.id = $1;`, 
        [id]);

    let game = { ...game_rows[0], category}
    
    return game;
} 

async function addGame({name,disc,category,price,stock,logo_img_url,cover_img_url, publisher, release_date, rating}) {

    // insert the game
    let query = `INSERT INTO items (name, logo_img_url, cover_img_url, disc, price, rating, publisher, release_date, stock) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    let values = [name, logo_img_url, cover_img_url, disc, price, rating, publisher, release_date, stock];
    await pool.query(query, values);

    // extract the unique id of game
    const { rows : selectRows} = await pool.query('select id from items where name=$1 and disc=$2', [name, disc]);
    const game_id = selectRows[0].id;

    // insert the category_id into game_category table
    for(let category_id in category){
        await pool.query('insert into game_category (game_id, category_id) values ($1, $2)', [game_id, category[category_id]]);
    }

    return game_id;
}




// category database queries
async function getCategoryById(id) {
    const {rows : category_rows} = await pool.query('SELECT * FROM category where id=$1',[id]);

    const {rows : games} = await pool.query(
        `select items.id, items.name, items.logo_img_url from items 
        join game_category ON game_category.game_id = items.id
        join category on game_category.category_id = category.id
        where category.id = $1;`, 
        [id]);

    let category = { ...category_rows[0], games}
    return category;
}

async function getCategories() {
    const {rows} = await pool.query('SELECT id, name, imgurl from category');
    return rows;
}

async function addCategory({name, disc, img_url}) {
    await pool.query('insert into category (name, imgurl, disc) VALUES ($1, $2, $3)', [name, img_url, disc]);

    // extract the unique id of game
    const { rows : selectRows} = await pool.query('select id from category where name=$1 and disc=$2', [name, disc]);
    const category_id = selectRows[0].id;
    return category_id;
}


module.exports = {getGames, getGameById, getCategoryById, getCategories,addGame, addCategory}