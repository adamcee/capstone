/** npm module imports */
const express = require('express');
const mongoose = require('mongoose');

/** Source code imports */
// Mongoose models
const GroceryItem = require('./models/grocery-item');

// Miscellaneos
const GROCERY_ITEMS = require('./grocery-items');



// helper function
const formatItems = items => items.map(item => ({ name: item.name, type: item.type }));

// db config
const DB_NAME = 'capstone';
const DB_URL = `mongodb://localhost:27017/${DB_NAME}`;

/** Connect to our MongoDB database  */

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

/** Create and start our express server **/

// express server config
const PORT = 9999;

console.log('starting express')
const app = express();

/** configure express server middleware */
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

/***
 * NOTE: If desired you could use async/await instead of promises, which would look like this:
 * See https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await
 * and https://blog.risingstack.com/mastering-async-await-in-nodejs/
  ```
      app.get('/grocery-items', async (req, res) => {
        const groceryItems = await GroceryItem.find();
        const formattedItems = groceryItems.map(item => ({ name: item.name, type: item.type }));
        res.send(formattedItems);
      })
  ```
 */

app.get('/grocery-items', (req, res) => {
  GroceryItem
    // Calling .find() on a model w/out any arguments gets all documents for that collection : )
    .find()     
    .then(allGroceryItems => {
      const formattedItems = allGroceryItems.map(item => ({ name: item.name, type: item.type }));
      res.send(formattedItems);
    })
    .catch(error => res.send(`Error on ${req.path} - ${error}`));
})

app.get('/grocery-items/:type', (req, res) => {
  const type = req.params.type;

  if(type && type === 'fruit' || type === 'vegetable') {
    GroceryItem
      .find({ type: type })
      .then(desiredItems => {
        res.send(formatItems(desiredItems));
      })
      .catch(error => res.send(`Error - ${JSON.stringify(error)}`));
  }

  else {
    res.send(`Invalid route - ${req.path}. Valid routes are 'fruit', 'vegetable'`)
  }

})


app.post('/grocery-items', (req, res) => {
  const body = req.body;

  // create mongoose GroceryItem model instance. we can then save this to mongodb as a document
  const newItem = new GroceryItem({ name: body.name, type: body.type });
  
  // TODO: USe JSON.stringify() for req.body and error so they are human readable in messages back to client
  // save to mongodb
  newItem
    .save()
    // success callback
    .then(() => res.send(`${JSON.stringify(req.body)} Grocery Item created!`))
    // error/failure callback
    .catch(error => res.send(`ERROR: Undable to create ${JSON.stringify(req.body)} grocery item. Err is ${JSON.stringify(error)}`));
})


/** Start express server  */
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})

/***
async function main() {
  // connect to database

// Express routes for our API

  // parse POST request body data


  // TODO: This is not working yet.
  app.delete('/grocery-items/:type/:name', async( req, res) => {
    const type = req.params.type;

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

}
**/

// main().catch(err => console.log(err));
