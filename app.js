// getting-started.js
const mongoose = require('mongoose');

async function main() {
  console.log('main function');
  await mongoose.connect('mongodb://localhost:27017/capstone');

  const kittySchema = new mongoose.Schema({
    name: String,
    gender: String,
  });

  kittySchema.methods.speak = function speak() {
    const greeting = this.name
      ? "Meow name is " + this.name
      : "I don't have a name";
    console.log(greeting);
  };

  const Kitten = mongoose.model('Kitten', kittySchema);

  const silence = new Kitten({ name: 'Silence', gender: 'Male' });
  const golden = new Kitten({ name: 'Golden', gender: 'Female' });

  await silence.save();
//   await golden.save();

  console.log(silence.name); // 'Silence'
  console.log(silence.gender); // 'Silence'

  const kittens = await Kitten.find();
  // console.log(kittens);
  silence.speak();

  await Kitten.find({ name: /^Silence/ });

}

mongoose.connection.on('open', () => console.log('db connected'));


main().catch(err => console.log(err));
