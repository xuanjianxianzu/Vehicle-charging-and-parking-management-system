const express = require('express');
const app = express();
const cors = require('cors')
const main = require('./controllerAPI/main')


app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors()); 

app.use('/api',main)

app.listen(3060);

console.log("Server up and running on port 3060");