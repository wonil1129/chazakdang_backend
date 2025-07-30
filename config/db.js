const mysql = require('mysql2');

const db  = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'dlfdnjs6717',
    port : 3306,
    database : 'userDB'
});

db.connect((err) => {
    if(err) {
        console.error('DB 연결 실패:', err);
        return;}
    console.log('DB 연결 성공');
    });

    module.exports = db;