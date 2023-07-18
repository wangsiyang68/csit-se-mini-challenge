const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const flightSchema = new Schema({
    airline : String,
    airlineid : Number,
    srcairport : String,
    srcairportid : Number,
    destairport : String,
    destairportid : Number,
    codeshare : String,
    stop : Number,
    eq : String,
    airlinename : String,
    srcairportname : String,
    srccity : String,
    srccountry : String,
    destairportname : String,
    destcity : String,
    destcountry : String,
    price : Number,
});

module.exports = mongoose.model('flights', flightSchema);