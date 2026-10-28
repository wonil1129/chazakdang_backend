require('dotenv').config();

const mysql = require('mysql2');

// 접속 정보는 모두 .env 에서 읽는다 (.env.example 참고)
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'userDB',
});

module.exports = db;
