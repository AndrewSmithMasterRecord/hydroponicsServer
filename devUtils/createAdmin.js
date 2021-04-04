const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');

dotenv.config({ path: '../conf.env' });

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((con) => {
    console.log('DB connection successful!');
  });

const importAdmin = async () => {
  try {
    const user = await User.create({
      name: process.env.USER,
      password: process.env.PASSWORD,
      passwordConfirm: process.env.PASSWORD,
      role: "admin"
    });
    console.log(user);
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};
importAdmin();

