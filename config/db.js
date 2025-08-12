require('dotenv').config();

const mysql = require('mysql2');

const db  = mysql.createPool({
    host : '0.0.0.0',
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    port : 3306,
    database : 'userDB'
});

module.exports = db;