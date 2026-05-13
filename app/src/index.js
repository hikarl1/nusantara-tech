const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'db',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: 5432,
});

pool.query(`
    CREATE TABLE IF NOT EXISTS mahasiswa (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(100),
        nim VARCHAR(20)
    )
`);

app.get('/mahasiswa', async (req, res) => {
    const result = await pool.query('SELECT * FROM mahasiswa');
    res.json(result.rows);
});

app.post('/mahasiswa', async (req, res) => {
    const { nama, nim } = req.body;
    const result = await pool.query(
        'INSERT INTO mahasiswa (nama, nim) VALUES ($1, $2) RETURNING *',
        [nama, nim]
    );
    res.json(result.rows[0]);
});

app.delete('/mahasiswa/:id', async (req, res) => {
    await pool.query('DELETE FROM mahasiswa WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
});

app.listen(3000, () => console.log('App running on port 3000'));