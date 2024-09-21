const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 5000;

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '@Root123',
    database: 'picture',
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});

// Middleware
app.use(cors({
    origin:'http://localhost:5173',
    methods:['POST','GET','DELETE','PUT']
}));
app.use(bodyParser.json());


// Routes
app.post('/api/areas', (req, res) => {
    const areas = req.body;
    // Process and save to database
    for (const area of areas) {
        const areaName = Object.keys(area)[0];
        const coordinates = area[areaName];
        const query = 'INSERT INTO areas (name, coordinates) VALUES (?, ?)';
        db.query(query, [areaName, JSON.stringify(coordinates)], (err) => {
            if (err) throw err;
        });
    }
    res.status(201).send('Areas saved!');
});

app.delete('/api/areas/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM areas WHERE id = ?'; // Make sure your areas table has an `id` field
    db.query(query, [id], (err) => {
        if (err) throw err;
        res.status(200).send('Area deleted!');
    });
});

app.put('/api/areas/:id', (req, res) => {
    const { id } = req.params;
    const { coordinates } = req.body;
    const query = 'UPDATE areas SET coordinates = ? WHERE id = ?';
    db.query(query, [JSON.stringify(coordinates), id], (err) => {
        if (err) throw err;
        res.status(200).send('Area updated!');
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
