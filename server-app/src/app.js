/** npm module imports */
const express = require('express');
const mongoose = require('mongoose');
const cors = require ('cors');

// Use dotenv to load environment variables from .env file so we can access them via process.env
require('dotenv').config()

/** Source code imports */
// Mongoose models
const GroceryItem = require('./api/models/grocery-item');

// Routes
const routes = require('./api/routes/v1');

// Miscellaneos
const GROCERY_ITEMS = require('../test/data/grocery-items');


// db config
const DB_URL = process.env.DB_URL;



/** Connect to our MongoDB database  
 **/
console.log(`connecting to db at ${DB_URL}`);

// Configure mongoose to tell us if we succeed or if we fail to connect to the database
mongoose.connection.on('open', () => `MongoDB: Successfully connected to ${DB_URL}`);
mongoose.connection.on('error', (error) => `MongoDB: Failed to connected to ${DB_URL}. Error ${error}`);

// IMPORTANT: If you are connecting to a database on your local machine be sure it is running first.
// We have to do this before we can save any Models to the database or get data from database.
console.log('MongoDB: Attempting to connect ...');
mongoose
  .connect(DB_URL)
  // handle error messages after successfully connectiong
  .catch(error => console.error(`MongoDB: Error ${error}`));


// Create some test data in the database for our app
/***
GROCERY_ITEMS.forEach(item => {
  const itemModel = new GroceryItem({ name: item.name, type: item.type });
  // NOTE: If desired see here for how to make this an upsert to get rid of annoying error messages:
  // https://masteringjs.io/tutorials/mongoose/upsert
  itemModel
    .save() 
    .catch(error => {
      console.log(`MongoDB: Error on save: `, error.errmsg);
    })
});
***/

/** 
 * Create and start our express server 
 * **/

// express server config
const PORT = process.env.SERVER_PORT;

console.log('starting express')
const app = express();

/** 
 * Configure express server middleware 
 **/

// this allows us to parse HTTP POST request bodies 
app.use(express.json());
// Handle CORS (cross-origin-requests) issues so that our react app can be hosted
// by a different server and still make HTTP requests to this one.
app.use(cors());

// For development - console each HTTP request to the server
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} with param ${JSON.stringify(req.params)}`);
  // For things like POST requests that have a body in the HTTP request, print that too
  if (req.body) {
    console.log(JSON.stringify(req.body));
  }

  // We need to call next() to tell express that our middleware function here is done and
  // that express should pass the request on to the next handling function - which will either
  // be more middleware or our routing code!
  next(); 
});

/** Express server routes */
app.get('/', (req, res) => {
  res.send('Hello World!')
})

/** Mount all our various API routes here */
app.use('/v1', routes);

/** Start express server  */
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
