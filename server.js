/* Module Imports */
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const {MongoClient} = require('mongodb');

/* Express Setup */
const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(morgan('dev'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        );
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
        
        next();
    });
    
/* Routes */
const controllers = require('./controllers/database-controllers');

app.get("/flight", controllers.getFlight);
app.get("/hotel", controllers.getHotel);

const uri = 'mongodb+srv://userReadOnly:7ZT817O8ejDfhnBM@minichallenge.q4nve1r.mongodb.net/';

// mongoose
//     .connect(uri)
//     .then(() => {
app.listen(PORT);
//     })    
//     .catch(err => {
//         console.log(err);
//     });