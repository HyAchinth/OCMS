const mySQL = require("mysql2");

const pool = mySQL.createPool({
    user:"root",
    password:"root",
    host:"localhost",
    database:"ocms"
});

const mysql = pool.promise();

module.exports = {mysql};