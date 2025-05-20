const dbcon = require('./models/admin_connection_database')//数据库连接模块
require('dotenv').config();//加载环境变量
const express = require('express');
const cors = require('cors');
const client = require('./controllerAPI/client_side');//客户端api路由模块
const admin = require('./controllerAPI/admin_side');//管理端api路由模块
const jwt = require('jsonwebtoken');
const app = express();//创建express实例


//挂载在根路由的中间件,检查令牌和状态.
app.use('/api', async (req, res, next) => {
    if (req.method === 'OPTIONS') return next();//// 让OPTIONS预检请求直接通过.
    if (req.url === '/client/register' || req.url === '/client/login'||req.url === '/admin/login') {//跳过登录注册的令牌验证
      return next();
    }
    const authHeader = req.headers.authorization;//检查是否携带令牌
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        data: null,
        meta: {
          msg: "缺少有效的 Authorization 头部",
          status: 401
        }
      });
    }
    const token = authHeader.split(' ')[1];//拆分出令牌
    let connection
    try {
      connection=await dbcon.getConnection();//数据库查询用户的状态
      const decoded = jwt.verify(token, process.env.JWT_SECRET);//解析令牌包含的信息
      const [users] = await connection.query(//查询该令牌对应的用户
      'SELECT * FROM users WHERE id = ?',
      [decoded.userId]
    );
    if (users.length === 0 || users[0].status == 'Ban') {//检查用户是否被封禁,限制封禁用户的资源请求.
      return res.status(403).json({//当状态不对时返回信息账户已被禁用或不存在
        data: null,
        meta: { msg: "账户已被禁用或不存在", status: 403 }
      });
    }
    req.user = { ...decoded, role: users[0].role };//将用户信息附加到请求对象中
    next();//通过
    } catch (err) {//错误处理
      return res.status(401).json({
        data: null,
        meta: {
          msg: "token无效或已过期",
          status: 401
        }
      });
    }finally {
        if (connection) await connection.end();//释放数据库连接池
    }
  });

app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true }));// 解析URL编码请求体
app.use(cors({//跨域资源请求
    methods: ['GET', 'POST', 'PUT', 'DELETE'],// 允许的HTTP方法
    allowedHeaders: ['Content-Type', 'Authorization'],// 允许的请求头
    exposedHeaders: ['Authorization'],
    credentials: true
  })); 

app.use('/api/client',client);//客户端路由挂载到/client
app.use('/api/admin',admin);//管理端路由挂载到/admin

app.listen(3060);//启动服务器

console.log("Server up and running on port 3060");