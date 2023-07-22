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

app.use((error, req, res, next) => {  //special error checking function, when routes return error
    if (res.headerSent) {   //check if response has been sent, because can only send 1 response
        return next(error)
    }
    res.status(error.code || 500);
    res.json({message: error.message || 'An unkown error occured'});
})

// mongoose
//     .connect(uri)
//     .then(() => {
app.listen(PORT);
//     })    
//     .catch(err => {
//         console.log(err);
//     });