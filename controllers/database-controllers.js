const {MongoClient} = require('mongodb');
const HttpError = require('../models/http-error');

function isValidDate(dateString) {
    // source: https://stackoverflow.com/questions/18758772/how-do-i-validate-a-date-in-this-format-yyyy-mm-dd-using-jquery
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if(!dateString.match(regEx)) return false;  // Invalid format
    
    var d = new Date(dateString);

    // check for 0 values in the date (invalid date)
    var dNum = d.getTime();
    if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
    
    // check for incorrect leap days
    return d.toISOString().slice(0,10) === dateString;
  }

const getFlight = async (req, res, next) => {
    const uri = 'mongodb+srv://userReadOnly:7ZT817O8ejDfhnBM@minichallenge.q4nve1r.mongodb.net/';
    const client = new MongoClient(uri);

    // Get the query parameters from the URL
    var destination = req.query.destination;    
    const departureDate = new Date(req.query.departureDate);
    const returnDate = new Date(req.query.returnDate);
    
    try {
        if (req.query.destination == undefined || req.query.departureDate == undefined || req.query.returnDate == undefined){
            return next(new HttpError("Missing query", 400));
        }

        if (!isValidDate(req.query.departureDate) || !isValidDate(req.query.returnDate)) {
            return next(new HttpError("Invalid Date Input", 400));
        }        

        // convert to format where only first letter of each word is capitalized
        
        destination = destination.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
        // https://dba.stackexchange.com/questions/323361/replace-every-character-in-each-word-except-of-first-first-two-charachters
        destination = destination.replace(/(?<=\w{1})[^\s]/g, letter => letter.toLowerCase());

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
            // return next(new HttpError('Request failed with status code', 404))
            res.status(200).json([])
        }    
        else {
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

    const checkInDate = new Date(req.query.checkInDate);
    const checkOutDate = new Date(req.query.checkOutDate);
    var destination = req.query.destination;

    try {
        if (req.query.destination == undefined || req.query.checkInDate == undefined || req.query.checkOutDate == undefined){
            return next(new HttpError("Missing query", 400));
        }

        if (!isValidDate(req.query.checkInDate) || !isValidDate(req.query.checkOutDate)) {
            return next(new HttpError("Invalid Date Input", 400));
        }

        // convert to format where only first letter of each word is capitalized
        destination = destination.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
        destination = destination.replace(/(?<=\w{1})[^\s]/g, letter => letter.toLowerCase());

        await client.connect();
        const dbo = client.db("minichallenge");
        const hotelNames = await dbo.collection("hotels").distinct("hotelName", {city : destination, date: { $gte: checkInDate, $lte: checkOutDate }});
        const hotels = await dbo.collection("hotels").find({city : destination, date: { $gte: checkInDate, $lte: checkOutDate }}).toArray();

        // create a json object with key value pair of hotelName and price (default 0)
        let hotelPrices = {};
        for (let hotelName of hotelNames) {
            hotelPrices[hotelName] = 0;
        }

        if (hotelNames.length === 0) {
            throw new Error('No such hotel');
        }

        // loop through each date from checkInDate to checkOutDate
        for (let eachDate = checkInDate; eachDate <= checkOutDate; eachDate.setDate(eachDate.getDate() + 1)) {
            hotelToday = hotels.filter(hotel => hotel.date.valueOf() == eachDate.valueOf());
            
            // loop through each hotelName in hotelNames, check if it exists in hotelToday list
            for (let hotelName of hotelNames) {
                let selectedHotelToday = hotelToday.filter(hotel => hotel.hotelName === hotelName)

                // if hotelName does not exist in hotelToday
                if (selectedHotelToday.length === 0) { 
                    // remove hotelName from hotelNames
                    hotelNames.splice(hotelNames.indexOf(hotelName), 1); 
                } else {
                    // console.log(selectedHotelToday.sort((a, b) => a.price - b.price)[0].price)
                    // add the lowest price of the day to the hotelName
                    hotelPrices[hotelName] += selectedHotelToday.sort((a, b) => a.price - b.price)[0].price; 
                }
            }
        }

        // Check again because the code above may have removed all hotels from hotelNames
        if (hotelNames.length === 0) {
            throw new Error('No such hotel');
        }    

        keyValuePairs = Object.entries(hotelPrices).sort((a, b) => a[1] - b[1]);
        // res.json(keyValuePairs[0]);
        res.status(200).json([{
            "City": destination, 
            "Check In Date": req.query.checkInDate,
            "Check Out Date": req.query.checkOutDate,
            "Hotel": keyValuePairs[0][0],
            "Price": keyValuePairs[0][1]
        }]);
    }

    catch (e) {
        res.status(200).json([]);
    } finally {
        await client.close();
    }
}

exports.getFlight = getFlight;
exports.getHotel = getHotel;