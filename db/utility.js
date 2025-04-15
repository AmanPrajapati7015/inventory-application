import dotenv from 'dotenv';
dotenv.config();
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    connectionString: process.env.CONNECTION_STRING
});

async function connectDB() {
    await client.connect();
    console.log("Connected to the database");
}

// 1. Place an order  - checked
async function placeOrder(cust_id, game_ids, payment_method) {
    try {
      await client.query("BEGIN");
      const paymentRes = await client.query(
        "INSERT INTO payment (transaction_number, payment_method) VALUES ($1, $2) RETURNING payment_id",
        ["TXN" + Date.now(), payment_method]
      );
      const payment_id = paymentRes.rows[0].payment_id;
  
      const totalPriceRes = await client.query(
        "SELECT SUM(price) AS total FROM Games WHERE game_id = ANY($1)",
        [game_ids]
      );
      const totalAmount = totalPriceRes.rows[0].total;
      
      const orderDate = new Date().toISOString();
  
      const orderRes = await client.query(
        "INSERT INTO \"order\" (cust_id, amount, payment_id, date) VALUES ($1, $2, $3, $4) RETURNING order_id",
        [cust_id, totalAmount, payment_id, orderDate]
      );
      const order_id = orderRes.rows[0].order_id;
  
      for (let game_id of game_ids) {
        await client.query("INSERT INTO game_order (game_id, order_id) VALUES ($1, $2)", [game_id, order_id]);
      }
  
      await client.query("COMMIT");
      console.log(`Order placed successfully with ID: ${order_id}, Total: ${totalAmount}, Date: ${orderDate}`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error placing order:", error);
    }
  }
  


// 2a. Get games with publisher and category info - checked
async function getGamesWithDetails() {
    const res = await client.query(
      `SELECT g.game_id, g.name, g.price, p.pub_name, 
              ARRAY_AGG(c.cat_name) AS categories 
       FROM Games g 
       JOIN publisher p ON g.publisher_id = p.publisher_id 
       JOIN game_cat gc ON g.game_id = gc.game_id 
       JOIN Categories c ON gc.cat_id = c.cat_id 
       GROUP BY g.game_id, g.name, g.price, p.pub_name`
    );
    console.table(res.rows);
  }

// 2b. Get order details - checked
async function getOrderDetails(order_id) {
    const res = await client.query(
      `SELECT o.order_id, o.date, o.amount, c.cust_name, 
              ARRAY_AGG(g.name) AS games, p.payment_method, p.transaction_number
       FROM "order" o 
       JOIN Customer c ON o.cust_id = c.cust_id 
       JOIN game_order go ON o.order_id = go.order_id 
       JOIN Games g ON go.game_id = g.game_id 
       JOIN payment p ON o.payment_id = p.payment_id 
       WHERE o.order_id = $1
       GROUP BY o.order_id, o.date, o.amount, c.cust_name, p.payment_method, p.transaction_number`,
      [order_id]
    );

    console.log(res.rows[0]);
    return res.rows[0];
  }

// 3. Add a customer - checked
async function addCustomer(cust_name, password, dob) {
    await client.query(
      "INSERT INTO Customer (cust_name, password, dob) VALUES ($1, $2, $3)",
      [cust_name, password, dob]
    );
    console.log("Customer added successfully");
  }

// 4. Add a game with categories
async function addGame(name, price, publisher_id, category_ids, rating, pg_rating, release_date) {
    try {
      await client.query("BEGIN");
      const gameRes = await client.query(
        "INSERT INTO Games (name, price, publisher_id, rating, pg_rating, release_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING game_id",
        [name, price, publisher_id, rating, pg_rating, release_date]
      );
      const game_id = gameRes.rows[0].game_id;
      
      for (let cat_id of category_ids) {
        await client.query("INSERT INTO game_cat (cat_id, game_id) VALUES ($1, $2)", [cat_id, game_id]);
      }
      
      await client.query("COMMIT");
      console.log("Game added successfully with categories");
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error adding game:", error);
    }
  }

// 5. Get past orders of a customer -checked
async function getCustomerOrders(cust_id) {
    const res = await client.query(
      `SELECT order_id FROM "order" WHERE cust_id = $1`,
      [cust_id]
    );
    
    let orders = [];
    for (let row of res.rows) {
      const orderDetails = await getOrderDetails(row.order_id);
      orders.push(orderDetails);
    }
    
    console.table(orders);
  }


connectDB();



// await getGamesWithDetails();

// await addCustomer("abhishek", "aman7015", "2004-12-15")

// await getOrderDetails("2");

// await getCustomerOrders("1");

// await placeOrder(5, [1,2,4], "Debig Card");



// await addGame("GOT", 199.99, 1, [1,2,3], 4.9, "M", new Date());
await addGame("kk", 22, 3, [2,3,4], 5, "M", new Date());




