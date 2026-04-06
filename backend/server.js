require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir frontend compilado
const frontendPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
}

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.APP_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database schema and optionally populate
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        bus_number INTEGER NOT NULL,
        seat_number INTEGER NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        cedula VARCHAR(50) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        total NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(bus_number, seat_number)
      );
      
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(50) PRIMARY KEY,
        value BOOLEAN NOT NULL
      );
    `);

    // Ensure sold_out exists
    await pool.query(`
      INSERT INTO settings (key, value)
      VALUES ('sold_out', false)
      ON CONFLICT (key) DO NOTHING;
    `);

    // Check if table is empty
    const { rows } = await pool.query('SELECT COUNT(*) FROM reservations');
    if (parseInt(rows[0].count) === 0) {
      console.log('Reservations table is empty. Checking for reservas.json...');
      const reservasPath = path.join(__dirname, 'reservas.json');
      if (fs.existsSync(reservasPath)) {
        const data = JSON.parse(fs.readFileSync(reservasPath, 'utf8'));
        console.log(`Found ${data.length} reservations to insert.`);
        for (const r of data) {
          await pool.query(
            'INSERT INTO reservations (bus_number, seat_number, full_name, cedula, phone, total) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
            [r.bus_number, r.seat_number, r.full_name, r.cedula, r.phone, r.total]
          );
        }
        console.log('Successfully seeded database from reservas.json.');
      }
    }
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initDb();

// Routes
app.get('/api/reservations', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM reservations ORDER BY bus_number, seat_number');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/reservations', async (req, res) => {
  const { reservations } = req.body; // Expecting an array of reservations
  if (!reservations || !Array.isArray(reservations) || reservations.length === 0) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if system is sold out
    const soldOutRes = await client.query("SELECT value FROM settings WHERE key = 'sold_out'");
    if (soldOutRes.rows[0]?.value) {
      throw new Error('SYSTEM_SOLD_OUT');
    }

    const inserted = [];
    for (const resData of reservations) {
      const { bus_number, seat_number, full_name, cedula, phone, total } = resData;
      
      const { rows } = await client.query(
        'INSERT INTO reservations (bus_number, seat_number, full_name, cedula, phone, total) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [bus_number, seat_number, full_name, cedula, phone, total]
      );
      inserted.push(rows[0]);
    }
    
    await client.query('COMMIT');
    res.status(201).json(inserted);
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.message === 'SYSTEM_SOLD_OUT') {
      return res.status(403).json({ error: 'Seats are sold out.' });
    }
    if (error.code === '23505') { // Postgres unique_violation
      return res.status(409).json({ error: 'One or more selected seats are already reserved.' });
    }
    console.error('Reservation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM reservations WHERE id = $1', [id]);
    res.json({ message: 'Reservation deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/settings/sold-out', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT value FROM settings WHERE key = 'sold_out'");
    res.json({ sold_out: rows[0]?.value || false });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/settings/sold-out', async (req, res) => {
  try {
    const { sold_out } = req.body;
    await pool.query("UPDATE settings SET value = $1 WHERE key = 'sold_out'", [sold_out]);
    res.json({ success: true, sold_out });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/export/json', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM reservations ORDER BY bus_number, seat_number');
    res.header("Content-Type", 'application/json');
    res.send(JSON.stringify(rows, null, 2));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/export/csv', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM reservations ORDER BY bus_number, seat_number');
    const parser = new Parser({ fields: ['id', 'bus_number', 'seat_number', 'full_name', 'cedula', 'phone', 'total', 'created_at'] });
    const csv = parser.parse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('reservations.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fallback para React Router
if (fs.existsSync(frontendPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
