const {MongoClient} = require('mongodb');
const Flight = require('../models/flights');

const getFlight = async (req, res, next) => {
    const uri = 'mongodb+srv://userReadOnly:7ZT817O8ejDfhnBM@minichallenge.q4nve1r.mongodb.net/';
    const client = new MongoClient(uri);

    // Get the query parameters from the URL
    const destination = req.query.destination;    
    const departureDate = new Date(req.query.departureDate);
    const returnDate = new Date(req.query.returnDate);
    
    try {
        await client.connect();
        const dbo = client.db("minichallenge");
        const collection = dbo.collection("flights");
        
        // To filter the collection based on the query
        const departureQuery = {srccity : "Singapore", destcity : destination, date: departureDate};
        const returnQuery = {srccity : destination, destcity : "Singapore", date: returnDate};
        // To select required fields only from each document
        const projection = { price: 1, airlinename: 1, _id: 0 };

        // Get the necessary documents from collection based on query & projection
        const departureResult = await collection.find(departureQuery).project(projection).sort({price: 1}).toArray();
        const returnResult = await collection.find(returnQuery).project(projection).sort({price: 1}).toArray();

        res.json([{
            "City": destination, 
            "Departure Date": req.query.departureDate,
            "Departure Airline": departureResult[0].airlinename,
            "Departure Price": departureResult[0].price,
            "Return Date": req.query.returnDate,
            "Return Airline": returnResult[0].airlinename,
            "Return Price": returnResult[0].price
        }]);
    }
    catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

const getHotel = async (req, res, next) => {
    const uri = 'mongodb+srv://userReadOnly:7ZT817O8ejDfhnBM@minichallenge.q4nve1r.mongodb.net/';
    const client = new MongoClient(uri);

    checkInDate = new Date(req.query.checkInDate);
    checkOutDate = new Date(req.query.checkOutDate);
    destination = req.query.destination;

    try {
        await client.connect();
        const dbo = client.db("minichallenge");
        const hotelNames = await dbo.collection("hotels").distinct("hotelName", {city : destination, date: { $gte: checkInDate, $lte: checkOutDate }});
        const hotels = await dbo.collection("hotels").find({city : destination, date: { $gte: checkInDate, $lte: checkOutDate }}).toArray();
        // const collection = dbo.collection("hotels");
        // for (let hotelName of hotelNames) {
        //     // check if each date in date Range is available for hotelName in the hotels json
            
        // }
        // let hotelName = 'Hotel A'
        // let selectedHotelListings = hotels.filter(hotel => hotel.hotelName === hotelName)
        // console.log(checkInDate)
        // console.log(selectedHotelListings[0].date)
        // console.log(selectedHotelListings[0].date == checkInDate);
        // console.log(typeof(checkInDate))
        // console.log(typeof(selectedHotelListings[0].date))
        // console.log(selectedHotelListings.find(hotel => hotel.date == checkInDate.toISOString()));
        // return a subset of collection 
        res.json(hotelNames);
    }

    catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

exports.getFlight = getFlight;
exports.getHotel = getHotel;