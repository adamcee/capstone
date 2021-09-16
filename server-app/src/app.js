const express = require('express');
const mongoose = require('mongoose');

// src code imports
const GROCERY_ITEMS = require('./grocery-items');
const port = 9999;

const formatItems = items => items.map(item => ({ name: item.name, type: item.type }));

async function main() {
  // connect to database
  console.log('waiting to connect to db')
  const DB_NAME = 'capstone';
  await mongoose.connect(`mongodb://localhost:27017/${DB_NAME}`);

  console.log('starting express')
  const app = express();
  // Create schema for Grocery Items
  const groceryItemSchema = new mongoose.Schema({
    name: {
      type: String,
      unique: true,
      required: true,
    },
    type: String,
  });

  const GroceryItem = mongoose.model('GroceryItem', groceryItemSchema);

  GROCERY_ITEMS.forEach(item => {
    const itemModel = new GroceryItem({ name: item.name, type: item.type });
    itemModel
      .save() // actually saves to databse/creates item
      .catch(error => {
        console.log(`Non-critical Mongoose err on save: `, error.name);
      })
  })

// Express routes for our API

  // parse POST request body data
  app.use(express.json());

  // logging for development
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} with param ${JSON.stringify(req.params)}`);
    next(); 
  });

  app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  app.post('/grocery-items', async (req, res) => {
    console.log(req.body);
    const body = req.body;
    const newItem = new GroceryItem({ name: body.name, type: body.type });
    
    // TODO: USe JSON.stringify() for req.body and error so they are human readable in messages back to client
    newItem
      .save()
      // success callback
      .then(() => res.send(`${req.body} Grocery Item created!`))
      // error/failure callback
      .catch(error => res.send(`ERROR: Undable to create ${req.body} grocery item. Err is ${error}`));
  })

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

  app.get('/grocery-items', async (req, res) => {
    const groceryItems = await GroceryItem.find();
    const formattedItems = groceryItems.map(item => ({ name: item.name, type: item.type }));
    res.send(formattedItems);
  })

  app.get('/grocery-items/:type', async (req, res) => {
    const type = req.params.type;

    if(type && type === 'fruit' || type === 'vegetable') {
      const desiredItems = await GroceryItem.find({ type: type })
      res.send(formatItems(desiredItems));
    }

    res.send(`Invalid route - ${req.path}. Valid routes are 'fruit', 'vegetable'`)
  })

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
}

mongoose.connection.on('open', () => console.log('db connected'));


main().catch(err => console.log(err));
