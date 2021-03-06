const mySQL = require('mysql2');
const pool = mySQL.createPool({
    user: 'root',
    password: process.env.MY_SQL_PASSWORD,
    host: 'localhost',
    database: 'ocms',
});

const mysql = pool.promise();

module.exports = { mysql };
