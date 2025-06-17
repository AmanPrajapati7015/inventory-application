const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.CONNECTION_STRING });


// SIGNUP
router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', async (req, res, next) => {
  const { cust_name, password, dob } = req.body;
  try {
    await pool.query(
      'INSERT INTO customer (cust_name, password, dob) VALUES ($1, $2, $3)',
      [cust_name, password, dob]
    );
    res.redirect('/auth/login');
  } catch (err) {
    console.log(err);
    
    next(new Error(err.message));
  }
});

// LOGIN
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res, next) => {
  const { cust_name, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM customer WHERE cust_name = $1 AND password = $2',
      [cust_name, password]
    );
    if (result.rows.length > 0) {
      req.session.user = result.rows[0];
      res.redirect('/');
    } else {
      next(new Error('Invalid credentials'));
    }
  } catch (err) {
    next(new Error(err.message));
  }
});

// LOGOUT
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
