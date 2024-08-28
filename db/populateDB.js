require('dotenv').config();
const pg = require('pg');
const categoryData = require('./categoryData.json');

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
    for (let i = 0; i < categoryData.length; i++) {
        await pool.query(
            `INSERT INTO category (name, imgURL, disc) VALUES ($1, $2, $3)`,
            [categoryData[i].name, categoryData[i].imgURL, categoryData[i].desc]
        )
    }
    console.log(`inserted ${categoryData.length} values in category table`);
    


})();
