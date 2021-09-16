const mongoose = require('mongoose');

/**
 * Mongoose Model for our MongoDB Collection
 * See:
 *  https://mongoosejs.com/docs/models.html
 *  https://docs.mongodb.com/manual/core/databases-and-collections/#collections
 */

const groceryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    // This prevents duplicate documents w/the exact same info from being created for this model.
    unique: true,
    required: true,
  },
  type: String,
});

const GroceryItem = mongoose.model('GroceryItem', groceryItemSchema);

module.exports = GroceryItem;
