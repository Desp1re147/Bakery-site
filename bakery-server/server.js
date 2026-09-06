const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Увеличиваем лимит из-за картинок Base64

// Подключение к MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Ваш логин от MySQL (обычно root)
    password: '',      // Ваш пароль (в XAMPP обычно пустой)
    database: 'bakery_db',
    port: '3307'
});

db.connect(err => {
    if (err) throw err;
    console.log('Подключено к MySQL!');
});

// 1. API: Получить товары (с возможностью фильтрации)
app.get('/api/products', (req, res) => {
    const { category } = req.query; // Ловим параметр из URL
    
    let sql = 'SELECT * FROM products';
    let params = [];

    // Если запросили конкретную категорию, добавляем фильтр
    if (category) {
        sql += ' WHERE category = ?';
        params.push(category);
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

 
// 2. API: Добавить новый товар
app.post('/api/products', (req, res) => {
    // Добавили category сюда:
    const { title, price, img, weight, composition, calories, energy, category } = req.body; 
    
    // Обновили SQL-запрос (теперь 8 параметров)
    const sql = 'INSERT INTO products (title, price, img, weight, composition, calories, energy, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    
    db.query(sql, [title, price, img, weight, composition, calories, energy, category], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Товар добавлен!', id: result.insertId });
    });
});

// 3. API: Создать новый заказ
app.post('/api/orders', (req, res) => {
    const { clientName, clientPhone, clientAddress, clientComment, items, totalSum } = req.body;

    const sql = 'INSERT INTO orders (client_name, client_phone, client_address, client_comment, items, total_sum) VALUES (?, ?, ?, ?, ?, ?)';
    
    // Превращаем объект товаров в строку JSON для хранения в БД
    const itemsJson = JSON.stringify(items);

    db.query(sql, [clientName, clientPhone, clientAddress, clientComment, itemsJson, totalSum], (err, result) => {
        if (err) {
            console.error('Ошибка при сохранении заказа:', err);
            return res.status(500).json(err);
        }
        res.json({ message: 'Заказ успешно сохранен!', orderId: result.insertId });
    });
});

// API: Удалить товар по ID
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

// Запуск сервера
app.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});