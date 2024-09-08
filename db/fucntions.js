require('dotenv').config();
const {Pool} = require('pg');

const pool = new Pool({connectionString: process.env.CONNECTION_STRING});
// console.log(process.env.CONNECTION_STRING);


async function getGames() {
    const {rows} = await pool.query('SELECT id, name, logo_img_url from items');
    return rows;
}




module.exports = {getGames}