/** npm module imports */
const express = require('express');
const mongoose = require('mongoose');

/** Source code imports */
// Mongoose models
const GroceryItem = require('./models/grocery-item');

// Miscellaneos
const GROCERY_ITEMS = require('./test/data/grocery-items');


// db config
const DB_NAME = 'capstone';
const DB_URL = `mongodb://localhost:27017/${DB_NAME}`;

/** Connect to our MongoDB database  
 **/

// Configure mongoose to tell us if we succeed or if we fail to connect to the database
mongoose.connection.on('open', () => `MongoDB: Successfully connected to ${DB_URL}`);
mongoose.connection.on('error', (error) => `MongoDB: Failed to connected to ${DB_URL}. Error ${error}`);

// IMPORTANT: If you are connecting to a database on your local machine be sure it is running first.
// We have to do this before we can save any Models to the database or get data from database.
console.log('MongoDB: Attempting to connect ...');
mongoose
  .connect(`mongodb://localhost:27017/${DB_NAME}`)
  // handle error messages after successfully connectiong
  .catch(error => console.error(`MongoDB: Error ${error}`));


// Create some test data in the database for our app
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

/** 
 * Create and start our express server 
 * **/

// express server config
const PORT = 9999;

console.log('starting express')
const app = express();

/** 
 * Configure express server middleware 
 **/

// this allows us to parse HTTP POST request bodies 
app.use(express.json());

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

/**
   * @api {get} /grocery-items List all grocery items 
   * @apiDescription Returns an array of all grocery items
   * @apiVersion 1.0.0
   * @apiName GetGroceryItems
   * @apiGroup GroceryItem
   * @apiPermission none
   *
   * @apiSuccess (200) {Object[]} groceryItems List of grocery items
   * @apiSuccess (200) {String}   name       Name of grocery item 
   * @apiSuccess (200) {String}   email      Type of grocery item
   *
   * @apiError (Bad Request 400)   
   */
app.get('/grocery-items', (req, res) => {
  GroceryItem
    .find()     
    .then(allGroceryItems => {
      const formattedItems = allGroceryItems.map(item => ({ name: item.name, type: item.type }));
      res.send(formattedItems);
    })
    .catch(error => res.send(`Error on ${req.path} - ${error}`));
})

/***
 * NOTE: If desired you could use async/await instead of promises, which would look like this:
 * See https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await
 * and https://blog.risingstack.com/mastering-async-await-in-nodejs/
  ```
    router.get('/grocery-items', async (req, res) => {
      const groceryItems = await GroceryItem.find();
      const formattedItems = groceryItems.map(item => ({ name: item.name, type: item.type }));
      res.send(formattedItems);
    })

  ```
 */

/**
   * @api {get} grocery-items/:type List all grocery items of type
   * @apiDescription Returns an array of all grocery items of a certain type
   * @apiVersion 1.0.0
   * @apiName GetGroceryItemsOfType
   * @apiGroup GroceryItem
   * @apiPermission none
   *
   * @apiSuccess (200) {Object[]} groceryItems List of grocery itemsb
   * @apiSuccess (200) {String}   name       Name of grocery item 
   * @apiSuccess (200) {String}   email      Type of grocery item
   *
   * @apiError (Bad Request 400)   
   */
app.get('grocery-items/:type', (req, res) => {
  const type = req.params.type;

  if(type && type === 'fruit' || type === 'vegetable') {
    GroceryItem
      .find({ type: type })
      .then(desiredItems => res.send(formatItems(desiredItems)))
      // Error handling
      .catch(error => res.send(`Error - ${JSON.stringify(error)}`));
  }

  else {
    res.send(`Invalid route - ${req.path}. Valid routes are 'fruit', 'vegetable'`)
  }
})

// TODO: Add apidoc documentation
app.post('/grocery-items', (req, res) => {
  const body = req.body;

  // create mongoose GroceryItem model instance. we can then save this to mongodb as a document
  const newItem = new GroceryItem({ name: body.name, type: body.type });
  
  // save to mongodb
  newItem
    .save()
    .then(() => res.send(`${JSON.stringify(req.body)} Grocery Item created!`))
    // Error handling
    .catch(error => res.send(`ERROR: Undable to create ${JSON.stringify(req.body)} grocery item. Err is ${JSON.stringify(error)}`));
})

/***
  // TODO: This is not working yet.
  app.delete('/grocery-items/:type/:name', async( req, res) => {
    const type = req.params.type;
    // helper function
  const formatItems = items => items.map(item => ({ name: item.name, type: item.type }));

    if(type && type === 'fruit' || type === 'vegetable') {
      const desiredItems = await GroceryItem.find({ type: type })
      res.send(formatItems(desiredItems));
    }

    res.send(`Invalid route - ${req.path}. Valid routes are 'fruit', 'vegetable'`)

    // TODO .find() is probably a promise, use .catch() to do err handling if we can't find the name
    const itemToDelete = await GroceryItem.find({name: req.params.name});

    itemToDelete
      .delete()
      .then(() => res.send(`${req.params.name} deleted`))
      .catch((err) => res.send(`Error - Unable to delete ${req.params.name}. ${err}`));

  });
**/

/** Start express server  */
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})