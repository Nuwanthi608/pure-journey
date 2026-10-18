const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Database Connection Configuration
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pure_journey_db'
});

// Connect to Database & Create Required Tables Automatically
db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('Connected to MySQL Database!');

  // Create Users Table if not exists
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create Trips Table if not exists
  const createTripsTable = `
    CREATE TABLE IF NOT EXISTS trips (
      id INT AUTO_INCREMENT PRIMARY KEY,
      destination VARCHAR(255) NOT NULL,
      trip_type VARCHAR(255) NOT NULL,
      days INT NOT NULL,
      members INT NOT NULL,
      start_date DATE,
      budget_level VARCHAR(255),
      transport_mode VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create Packing Items Table if not exists
  const createItemsTable = `
    CREATE TABLE IF NOT EXISTS packing_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_name VARCHAR(255) NOT NULL,
      category VARCHAR(255) DEFAULT 'General',
      item_type VARCHAR(255) DEFAULT 'Camping',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createUsersTable, (err) => {
    if (err) console.error('Error creating users table:', err);
  });

  db.query(createTripsTable, (err) => {
    if (err) console.error('Error creating trips table:', err);
  });

  db.query(createItemsTable, (err) => {
    if (err) console.error('Error creating packing items table:', err);
  });
});

// --- API ROUTES ---

// 1. User Registration Route
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Check if user already exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database query error.' });
    if (results.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists!' });
    }

    // Insert new user
    const insertQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(insertQuery, [name, email, password], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to register user.' });
      res.status(201).json({ message: 'User registered successfully!' });
    });
  });
});

// 2. User Login Route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter email and password.' });
  }

  db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database query error.' });
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.status(200).json({ message: 'Login successful!', user: results[0] });
  });
});

// 3. Save New Trip Route
app.post('/api/trips', (req, res) => {
  const { destination, trip_type, days, members, start_date, budget_level, transport_mode } = req.body;

  const query = 'INSERT INTO trips (destination, trip_type, days, members, start_date, budget_level, transport_mode) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
  db.query(query, [destination, trip_type, days, members, start_date, budget_level, transport_mode], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to save trip details.' });
    res.status(201).json({ message: 'Trip saved successfully!', tripId: result.insertId });
  });
});

// 4. Get Previous Trips History
app.get('/api/trips', (req, res) => {
  db.query('SELECT * FROM trips ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch trips.' });
    res.json(results);
  });
});

// 5. Get Packing Items by Trip Type
app.get('/api/items/:type', (req, res) => {
  const { type } = req.params;
  
  db.query('SELECT * FROM packing_items WHERE item_type = ? OR item_type = "General"', [type], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch items.' });

    // Fallback default items if database table is empty
    if (results.length === 0) {
      const defaultItems = [
        { id: 101, item_name: 'Reusable Stainless Steel Water Bottle', category: 'Hydration', item_type: type },
        { id: 102, item_name: 'Bamboo Utensil & Cutlery Set', category: 'Dining', item_type: type },
        { id: 103, item_name: 'Cloth Tote / Reusable Shopping Bag', category: 'General', item_type: type },
        { id: 104, item_name: 'Solid Shampoo & Soap Bar', category: 'Personal Care', item_type: type },
        { id: 105, item_name: 'Solar Powered Power Bank', category: 'Gear', item_type: type }
      ];
      return res.json(defaultItems);
    }

    res.json(results);
  });
});

// 6. Add Custom Packing Item Route
app.post('/api/items', (req, res) => {
  const { item_name, category, item_type } = req.body;
  
  const query = 'INSERT INTO packing_items (item_name, category, item_type) VALUES (?, ?, ?)';
  db.query(query, [item_name, category || 'General', item_type || 'General'], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to add custom item.' });
    res.status(201).json({ message: 'Item added successfully!', itemId: result.insertId });
  });
});

// 7. Delete Packing Item Route
app.delete('/api/items/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM packing_items WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete item.' });
    res.json({ message: 'Item deleted successfully!' });
  });
});

// Start Node.js Express Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});