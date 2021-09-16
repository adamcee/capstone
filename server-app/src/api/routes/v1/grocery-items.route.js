const express = require('express');

/** Source code imports */
// Mongoose models
const GroceryItem = require('../../models/grocery-item');

// create new express router
const router = express.Router();

/**
   * @api {get} v1/grocery-items List all grocery items 
   * @apiDescription Returns an array of all grocery items
   * @apiVersion 1.0.0
   * @apiName GetGroceryItems
   * @apiGroup GroceryItem
   * @apiPermission none
   *
   * @apiSuccess (200) {Object[]} groceryItems List of grocery itemsb
   * @apiSuccess (200) {String}   name       Name of grocery item 
   * @apiSuccess (200) {String}   email      Type of grocery item
   *
   * @apiError (Bad Request 400)   
   */
router.get('/', (req, res) => {
  GroceryItem
    // Calling .find() on a model w/out any arguments gets all documents for that collection : )
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
      app.get('/grocery-items', async (req, res) => {
        const groceryItems = await GroceryItem.find();
        const formattedItems = groceryItems.map(item => ({ name: item.name, type: item.type }));
        res.send(formattedItems);
      })
  ```
 */

/**
   * @api {get} v1/grocery-items/:type List all grocery items of type
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
router.get('/:type', (req, res) => {
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
router.post('/', (req, res) => {
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

module.exports = router;