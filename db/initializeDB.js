require('dotenv').config();
const { Client } = require("pg");


const client = new Client({
   connectionString: process.env.CONNECTION_STRING
});

async function setupDatabase() {
  try {
    await client.connect();
    console.log("Connected to the database");

    // Drop tables to avoid conflicts
    await client.query(`
      DROP TABLE IF EXISTS game_order, game_cat, develops, payment, "order", Customer, Games, publisher, categories CASCADE;
    `);

    // Create Tables
    await client.query(`
      CREATE TABLE publisher (
        publisher_id SERIAL PRIMARY KEY,
        pub_name VARCHAR(100) NOT NULL,
        address TEXT,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone_no VARCHAR(15) UNIQUE NOT NULL
      );

      CREATE TABLE Games (
        game_id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL,
        logo_img TEXT,
        cover_img TEXT,
        price DECIMAL(10,2) NOT NULL,
        rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
        pg_rating VARCHAR(10),
        release_date DATE,
        publisher_id INT,
        FOREIGN KEY (publisher_id) REFERENCES publisher(publisher_id) ON DELETE SET NULL
      );

      CREATE TABLE categories (
        cat_id SERIAL PRIMARY KEY,
        cat_name VARCHAR(100) NOT NULL,
        description TEXT
      );

      CREATE TABLE Customer (
        cust_id SERIAL PRIMARY KEY,
        cust_name VARCHAR(100) NOT NULL,
        password TEXT NOT NULL,
        dob DATE
      );

      CREATE TABLE payment (
        payment_id SERIAL PRIMARY KEY,
        transaction_number VARCHAR(50) UNIQUE NOT NULL,
        payment_method VARCHAR(50) NOT NULL
      );

      CREATE TABLE "order" (
        order_id SERIAL PRIMARY KEY,
        cust_id INT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        amount DECIMAL(10,2) NOT NULL,
        payment_id INT NOT NULL,
        FOREIGN KEY (cust_id) REFERENCES Customer(cust_id) ON DELETE CASCADE,
        FOREIGN KEY (payment_id) REFERENCES payment(payment_id) ON DELETE CASCADE
      );

      CREATE TABLE game_order (
        game_id INT NOT NULL,
        order_id INT NOT NULL,
        PRIMARY KEY (game_id, order_id),
        FOREIGN KEY (game_id) REFERENCES Games(game_id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES "order"(order_id) ON DELETE CASCADE
      );

      CREATE TABLE game_cat (
        game_id INT NOT NULL,
        cat_id INT NOT NULL,
        PRIMARY KEY (game_id, cat_id),
        FOREIGN KEY (game_id) REFERENCES Games(game_id) ON DELETE CASCADE,
        FOREIGN KEY (cat_id) REFERENCES categories(cat_id) ON DELETE CASCADE
      );

      CREATE TABLE develops (
        pub_id INT NOT NULL,
        game_id INT NOT NULL,
        PRIMARY KEY (pub_id, game_id),
        FOREIGN KEY (pub_id) REFERENCES publisher(publisher_id) ON DELETE CASCADE,
        FOREIGN KEY (game_id) REFERENCES Games(game_id) ON DELETE CASCADE
      );
    `);

    console.log("Tables created successfully!");

    // Insert Dummy Data
    await client.query(`
      INSERT INTO publisher (pub_name, address, email, phone_no) VALUES
      ('Ubisoft', '123 Ubisoft St, Paris, France', 'contact@ubisoft.com', '1234567890'),
      ('EA Games', 'Redwood City, CA, USA', 'support@ea.com', '0987654321'),
      ('Rockstar Games', 'NYC, USA', 'info@rockstar.com', '1122334455'),
      ('Nintendo', 'Kyoto, Japan', 'hello@nintendo.com', '6677889900');

      INSERT INTO Games (name, logo_img, cover_img, price, rating, pg_rating, release_date, publisher_id) VALUES
      ('Assassin Creed', 'logo1.png', 'cover1.jpg', 59.99, 4.5, 'M', '2023-09-15', 1),
      ('FIFA 24', 'logo2.png', 'cover2.jpg', 69.99, 4.7, 'E', '2023-10-01', 2),
      ('GTA V', 'logo3.png', 'cover3.jpg', 49.99, 4.9, 'M', '2013-09-17', 3),
      ('Zelda: BOTW', 'logo4.png', 'cover4.jpg', 59.99, 4.8, 'E', '2017-03-03', 4);

      INSERT INTO categories (cat_name, description) VALUES ('Action', 'Thrilling action games'),
      ('Sports', 'Real-world sports simulations'),
      ('Adventure', 'Exciting story-driven gameplay'),
      ('RPG', 'Role-playing games with deep narratives');

      INSERT INTO Customer (cust_name, password, dob) VALUES
      ('Alice Johnson', 'pass123', '1995-07-12'),
      ('Bob Smith', 'securepass', '1988-03-23'),
      ('Charlie Brown', 'mypassword', '2000-10-05');

      INSERT INTO payment (transaction_number, payment_method) VALUES
      ('TXN123456', 'Credit Card'),
      ('TXN789012', 'PayPal'),
      ('TXN345678', 'Bank Transfer');

      INSERT INTO "order" (cust_id, amount, payment_id) VALUES
      (1, 120.50, 1),
      (2, 69.99, 2),
      (3, 49.99, 3);

      INSERT INTO game_order (game_id, order_id) VALUES
      (1, 1), (1, 2), (2, 2), (3, 3), (3, 1), (4, 1), (4, 3);

      INSERT INTO game_cat (game_id, cat_id) VALUES
      (1, 1), (1, 3), (2, 2), (3, 1), (3, 4), (4, 1), (4, 3);

      INSERT INTO develops (pub_id, game_id) VALUES
      (1, 1), (2, 2), (3, 3), (4, 4);
    `);

    console.log("Dummy data inserted successfully!");
  } catch (err) {
    console.error("Error setting up the database:", err);
  } finally {
    await client.end();
    console.log("Disconnected from the database");
  }
}

setupDatabase();
