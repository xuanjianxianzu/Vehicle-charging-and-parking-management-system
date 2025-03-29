require('dotenv').config();
const express = require('express');
const cors = require('cors')
const main = require('./controllerAPI/main')
const jwt = require('jsonwebtoken');
const app = express();


app.use('/api',(req,res,next) => {
    if(req.url == '/register'||req.url == '/login'){
        return next();
    }

    const token = String(req.headers.authorization);
    console.log(token);
    if(token == 'undefined'&&token == 'null'){
        res.status(400).send({
            data:null,
            meta: {
                msg:"token无效",
                status:400
            }
        })
    }
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


})



app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors()); 

app.use('/api',main)

app.listen(3060);

console.log("Server up and running on port 3060");