# CSIT Software Engineering Mini Challenge

![CSIT Software Engineering Digital Badge](csit-digital-badge.jpg)

## Purpose
Refresh memory of Javascript/Nodejs previously learnt in school and pick up some practical Docker knowledge.

## Description
In the CSIT SE Mini Challenge, participants will build a REST API server, using any programming language of your choice (Python, Ruby, Typescript, to name a few...)

On the API server, participants should write two endpoints for Mighty Saver Rabbit's friends to query. (`/flight` and `/hotel`)

### Requirements

#### Flight route
Get a list of return flights at the cheapest price, given the destination city, departure date, and arrival date.

**Query Parameters**
|  Field | Type   | Description   |
| ------------ | ------------ | ------------ |
| departureDate  | String   |  Departure date from Singapore (YYYY-MM-DD) |
| returnDate  | String  | Return date from destination city. (YYYY-MM-DD)  |
| destination  | String  | Destination City, case insensitive   |

**Responses**

| Status Code | Description |
| --- | --- |
| 200 | Query Successful, Returns when there are 0 or more results in the returned array. 
| 400 | Bad input,  Returns when there are missing query parameters or date format is incorrect.|

**Response Format**

Returns an array containing the details of the cheapest return flights. There can be 0 or more items returned.

**Example Query**

`/flight?departureDate=2023-12-10&returnDate=2023-12-16&destination=Frankfurt`

**Example Response**
```javascript
[
  {
    "City": "Frankfurt",
    "Departure Date": "2023-12-10",
    "Departure Airline": "US Airways",
    "Departure Price": 1766,
    "Return Date": "2023-12-16",
    "Return Airline": "US Airways",
    "Return Price": 716
  }
]
```

#### Hotel route
Get a list of hotels providing the cheapest price, given the destination city, check-in date, and check-out date.

**Query Parameters**
|  Field | Type   | Description   |
| ------------ | ------------ | ------------ |
| checkInDate  | String   |  Date of check-in at the hotel (YYYY-MM-DD) |
| checkOutDate  | String  | Date of check-out at the hotel (YYYY-MM-DD)  |
| destination  | String  | Destination City, case insensitive   |

**Responses**

| Status Code | Description |
| --- | --- |
| 200 | Query Successful, Returns when there are 0 or more results in the returned array. 
| 400 | Bad input,  Returns when there are missing query parameters or date format is incorrect.|

**Response Format**

Returns an array containing the details of the cheapest hotels. There can be 0 or more items returned.

**Example Query**

`/hotel?checkInDate=2023-12-10&checkOutDate=2023-12-16&destination=Frankfurt`

**Example Response**
```javascript
[
  {
    "City": "Frankfurt",
    "Check In Date": "2023-12-10",
    "Check Out Date": "2023-12-16",
    "Hotel": "Hotel J",
    "Price": 2959
  }
]
```

## How to run 
Use the following nodejs code in the terminal to launch the server directly:

`node server`

To launch the server in the provided docker container, run the following code:
```bash
docker build . -t yangman/csit
docker -p <port number>:8080 -d yangman/csit
```
The `-d` flag helps to detach the container from the terminal once it is created.