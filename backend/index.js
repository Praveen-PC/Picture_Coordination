const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const db=require('./model/db')

const app = express();
const PORT = 5000;


app.use(cors({
    origin:'http://localhost:5173',
    methods:['POST','GET','DELETE','PUT']
}));
app.use(bodyParser.json());

 
app.get('/api/areas', (req, res) => {
    const query = 'SELECT * FROM areas';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});


app.post('/api/areas', (req, res) => {
    const areas = req.body;
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
    const query = 'DELETE FROM areas WHERE id = ?'; 
    db.query(query, [id], (err) => {
        if (err) throw err;
        res.status(200).send('Area deleted!');
    });
});

app.post('/api/areas/:id', (req, res) => {
    const { id } = req.params;
    const { coordinates } = req.body;
    const query = 'UPDATE areas SET coordinates = ? WHERE id = ?';
    db.query(query, [JSON.stringify(coordinates), id], (err) => {
        if (err) throw err;
        res.status(200).send('Area updated!');
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
