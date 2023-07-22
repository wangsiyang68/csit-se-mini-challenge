const {MongoClient} = require('mongodb');
const Flight = require('../models/flights');
const HttpError = require('../models/http-error');

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

        if (departureResult.length === 0 || returnResult.length === 0) {
            return next(new HttpError('Could not find flights for the provided information', 404))
        }    

        res.status(200).json([{
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

        // create a json object with key value pair of hotelName and price (default 0)
        let hotelPrices = {};
        for (let hotelName of hotelNames) {
            hotelPrices[hotelName] = 0;
        }

        for (let eachDate = checkInDate; eachDate <= checkOutDate; eachDate.setDate(eachDate.getDate() + 1)) {
            hotelToday = hotels.filter(hotel => hotel.date.valueOf() == eachDate.valueOf());
            console.log(eachDate)
            console.log(hotelToday.length)
            // console.log(hotelToday);
            for (let hotelName of hotelNames) {
                let selectedHotelToday = hotelToday.filter(hotel => hotel.hotelName === hotelName)
                if (selectedHotelToday === undefined) { // if hotelName does not exist in hotelToday
                    hotelNames.splice(hotelNames.indexOf(hotelName), 1); // remove hotelName from hotelNames
                } else {
                    console.log(selectedHotelToday.sort((a, b) => a.price - b.price)[0].price)
                    hotelPrices[hotelName] += selectedHotelToday.sort((a, b) => a.price - b.price)[0].price; // add the lowest price of the day to the hotelName
                }
            }
        }
        res.json(hotelPrices);
    }

    catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

exports.getFlight = getFlight;
exports.getHotel = getHotel;