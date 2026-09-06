const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bakery_db',
    port: '3307'
});

db.connect(err => {
    if (err) throw err;
    console.log('Подключено к MySQL!');
});

app.get('/api/products', (req, res) => {
    const { category } = req.query;
    
    let sql = 'SELECT * FROM products';
    let params = [];

    if (category) {
        sql += ' WHERE category = ?';
        params.push(category);
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/api/products', (req, res) => {
    const { title, price, img, weight, composition, calories, energy, category } = req.body; 
    
    const sql = 'INSERT INTO products (title, price, img, weight, composition, calories, energy, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    
    db.query(sql, [title, price, img, weight, composition, calories, energy, category], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Товар добавлен!', id: result.insertId });
    });
});

app.post('/api/orders', (req, res) => {
    const { clientName, clientPhone, clientAddress, clientComment, items, totalSum } = req.body;

    const sql = 'INSERT INTO orders (client_name, client_phone, client_address, client_comment, items, total_sum) VALUES (?, ?, ?, ?, ?, ?)';
    
    const itemsJson = JSON.stringify(items);

    db.query(sql, [clientName, clientPhone, clientAddress, clientComment, itemsJson, totalSum], (err, result) => {
        if (err) {
            console.error('Ошибка при сохранении заказа:', err);
            return res.status(500).json(err);
        }
        res.json({ message: 'Заказ успешно сохранен!', orderId: result.insertId });
    });
});

app.delete('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'DELETE FROM products WHERE id = ?';

    db.query(sql, [productId], (err, result) => {
        if (err) {
            console.error('Ошибка при удалении:', err);
            return res.status(500).json(err);
        }
        res.json({ message: 'Товар удален!' });
    });
});

app.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});