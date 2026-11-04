const mysql = require('mysql2');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cafe_connect',

    ssl: process.env.DB_SSL === 'false' ? undefined : {
        ca: fs.readFileSync(path.join(__dirname, 'ca.pem')),
        rejectUnauthorized: true
    },

    connectTimeout: 20000
});

module.exports = db;
