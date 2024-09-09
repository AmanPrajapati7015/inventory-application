require('dotenv').config();
const pg = require('pg');
const categoryData = require('./categoryData.json');
const itemsData = require('./itemsData.json');
const connectionData = require('./connectionData.json');

//connecting to database
const pool = new pg.Pool({
    connectionString: process.env.CONNECTION_STRING
});

(async function () {
    // creating category table
    await pool.query(
        `CREATE TABLE IF NOT EXISTS category (
            id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            name TEXT,
            imgURL TEXT,
            disc TEXT
        )`
    )
    console.log('created table category');

    //populating category table
    const {rows} =  await pool.query('SELECT * FROM category');
    if(rows.length==0){
        for (let i = 0; i < categoryData.length; i++) {
            await pool.query(
                `INSERT INTO category (name, imgURL, disc) VALUES ($1, $2, $3)`,
                [categoryData[i].name, categoryData[i].imgURL, categoryData[i].desc]
            )
        }
        console.log(`inserted ${categoryData.length} values in category table`);
    }
    

    //creating table 
    await pool.query(
        `CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            name TEXT,
            logo_img_url TEXT,
            cover_img_url TEXT,
            disc TEXT,
            price INTEGER,
            rating CHAR(4),
            publisher TEXT,
            release_date  DATE,
            stock INTEGER
        )`
    )
    console.log('created table items');

    //populating category table
    const res =  await pool.query('SELECT * FROM items');
    if(res.rows.length==0){
        itemsData.forEach( async (item)=>{
            const values = Object.values(item);
            await pool.query(
                `INSERT INTO items (name, logo_img_url, cover_img_url, disc, price, rating, publisher, release_date, stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                values
            )

        })
        console.log(`inserted ${itemsData.length} values in items table`);
    }


    //creating table connection
    await pool.query(
        `CREATE TABLE IF NOT EXISTS game_category (
            game_id INTEGER,
            category_id INTEGER,
            PRIMARY KEY (game_id, category_id),
            FOREIGN KEY (game_id) REFERENCES items(id),
            FOREIGN KEY (category_id) REFERENCES category(id)
        );`
    )
    console.log('created table game_category');

    //populating category table
    const resp =  await pool.query('SELECT * FROM game_category');
    if(resp.rows.length==0){
        connectionData.forEach( async (row)=>{
            await pool.query(
                `INSERT INTO game_category VALUES ($1, $2)`, 
                [row.game_id, row.category_id]
            );
        });
        console.log(`inserted ${connectionData.length} values in items table`);
    }

})();
