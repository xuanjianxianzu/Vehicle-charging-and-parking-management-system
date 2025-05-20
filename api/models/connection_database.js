//这是数据库连接配置模块
const dbModel = require("./db_model");//导入用户账户信息
const mysql = require('mysql2/promise');//导入mysql2库

module.exports = {
    getConnection:()=>{
        return mysql.createConnection({//创建数据库连接实例
            host:dbModel.host,
            user:dbModel.user,
            password:dbModel.password,
            database:dbModel.database
        });
    }
}