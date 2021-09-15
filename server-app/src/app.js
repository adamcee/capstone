const express = require('express');
const app = express();
const port = 9999;

const GROCERY_ITEMS = [
  {
    name: 'kiwi',
    type: 'fruit',
  },
  {
    name: 'banana',
    type: 'fruit',
  },
  {
    name: 'apple',
    type: 'fruit',
  },
  {
    name: 'pear',
    type: 'fruit',
  },
  {
    name: 'carrot',
    type: 'vegetable',
  },
  {
    name: 'zuccini',
    type: 'vegetable',
  },
  {
    name: 'tomato',
    type: 'vegetable',
  },
  {
    name: 'onion',
    type: 'vegetable',
  },
]

app.use((req, res, next) => {
  console.log(`${req.method} for ${req.path} with param ${req.params}`);
  next(); 
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/grocery-items', (req, res) => {
  res.send(GROCERY_ITEMS);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})