//a method used to connection to database 
const dbModel = require("./db_model");
const mysql = require('mysql2/promise');

module.exports = {
    getConnection:()=>{
        return mysql.createConnection({
            host:dbModel.host,
            user:dbModel.user,
            password:dbModel.password,
            database:dbModel.database
        });
    }
}