require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '456789',
  database: process.env.DB_NAME || 'pure_journey_db'
};

async function initializeServer() {
  try {
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await tempConnection.end();

    const db = mysql.createPool(dbConfig);

    // 1. Create Users Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create Trips Table
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT 1,
        destination VARCHAR(255) NOT NULL,
        trip_type VARCHAR(100) NOT NULL,
        days INT NOT NULL DEFAULT 1,
        members INT DEFAULT 1,
        start_date VARCHAR(255),
        budget_level VARCHAR(100) DEFAULT 'Moderate Standard',
        transport_mode VARCHAR(100) DEFAULT 'Train',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    // 3. Create Items Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        item_type VARCHAR(100) DEFAULT 'Camping',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database and Tables verified successfully!');

    // --- AUTH ROUTES (Fixed & Separated) ---
    app.post('/api/register', async (req, res) => {
      try {
        console.log('📥 Register Request:', req.body);
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
          return res.status(400).json({ error: 'Email already registered!' });
        }

        await db.query(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [name, email, password]
        );
        res.json({ message: 'Registration successful' });
      } catch (err) {
        console.error('❌ Register Error:', err.message);
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/login', async (req, res) => {
      try {
        console.log('📥 Login Request:', req.body);
        const { email, password } = req.body;
        
        const [rows] = await db.query(
          'SELECT * FROM users WHERE email = ? AND password = ?',
          [email, password]
        );
        if (rows.length > 0) {
          res.json({ message: 'Login successful', user: rows[0] });
        } else {
          res.status(401).json({ error: 'Invalid email or password.' });
        }
      } catch (err) {
        console.error('❌ Login Error:', err.message);
        res.status(500).json({ error: err.message });
      }
    });

    // --- TRIP & ITEM ROUTES ---
    app.get('/api/trips', async (req, res) => {
      try {
        const [rows] = await db.query('SELECT * FROM trips ORDER BY id DESC');
        res.json(rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/trips', async (req, res) => {
      try {
        let { destination, trip_type, days, members, start_date, budget_level, transport_mode } = req.body;
        const safeStartDate = (start_date && start_date !== 'Invalid date') ? String(start_date) : '';

        const [result] = await db.query(
          'INSERT INTO trips (destination, trip_type, days, members, start_date, budget_level, transport_mode) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [destination || 'Kandy', trip_type || 'Camping', days || 1, members || 1, safeStartDate, budget_level || 'Moderate Standard', transport_mode || 'Train']
        );
        res.json({ message: 'Trip saved successfully', tripId: result.insertId });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/api/items/:type', async (req, res) => {
      try {
        const tripType = req.params.type;
        const [rows] = await db.query('SELECT * FROM items WHERE item_type = ?', [tripType]);
        res.json(rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/items', async (req, res) => {
      try {
        const { item_name, category, item_type } = req.body;
        const [result] = await db.query(
          'INSERT INTO items (item_name, category, item_type) VALUES (?, ?, ?)',
          [item_name, category || 'General', item_type || 'Camping']
        );
        res.json({ message: 'Item added successfully', id: result.insertId });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

  } catch (err) {
    console.error('❌ Init Error:', err.message);
  }
}

initializeServer();

app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});