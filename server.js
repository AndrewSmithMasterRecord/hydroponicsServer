const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXEPTION 💥', err.name, err.message);
    process.exit(1);
});

dotenv.config({ path: './conf.env' });

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

const app = require('./app');

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION 💥', err);
  server.close(() => {
    process.exit(1);
  });
});