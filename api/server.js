require('dotenv').config();
const express = require('express');
const cors = require('cors');
const client = require('./controllerAPI/client_side');
const admin = require('./controllerAPI/admin_side');
const jwt = require('jsonwebtoken');
const app = express();


app.use('/api', (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next();
      }
    if (req.url === '/client/register' || req.url === '/client/login'||req.url === '/admin/login') {
      return next();
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('daaddd');
      return res.status(401).json({
        data: null,
        meta: {
          msg: "缺少有效的 Authorization 头部",
          status: 401
        }
      });
    }

    const token = authHeader.split(' ')[1];
    console.log(token);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({
        data: null,
        meta: {
          msg: "token无效或已过期",
          status: 401
        }
      });
    }
  });




app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    credentials: true
  })); 

app.use('/api/client',client);
app.use('/api/admin',admin)

app.listen(3060);

console.log("Server up and running on port 3060");