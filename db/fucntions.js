require('dotenv').config();
const {Pool} = require('pg');

const pool = new Pool({connectionString: process.env.CONNECTION_STRING});
// console.log(process.env.CONNECTION_STRING);


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



module.exports = {getGames, getGameById, getCategoryById}