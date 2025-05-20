//这是数据库连接配置模块
const dbModel = require("./admin_db_model");//导入管理账户信息
const mysql = require('mysql2/promise');//导入mysql2库

module.exports = {
    getConnection:()=>{//创建数据库连接实例
        return mysql.createConnection({
            host:dbModel.host,
            user:dbModel.user,
            password:dbModel.password,
            database:dbModel.database
        });
    }
}