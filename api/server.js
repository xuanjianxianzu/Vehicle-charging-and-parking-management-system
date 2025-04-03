require('dotenv').config();
const express = require('express');
const cors = require('cors')
const main = require('./controllerAPI/main')
const jwt = require('jsonwebtoken');
const app = express();


app.use('/api', (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next();
      }
    if (req.url === '/register' || req.url === '/login') {
      return next();
    }
    console.log('aaaa');
    //console.log(req);
    const authHeader = req.headers.authorization;
    console.log(authHeader);
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

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log('ddddd');
      next();
    } catch (err) {
        console.log('daadd1111d');
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

app.use('/api',main)

app.listen(3060);

console.log("Server up and running on port 3060");