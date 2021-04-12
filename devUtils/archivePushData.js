const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ArchiveModel = require('../models/archiveModel');

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

const createRecords = async () => {
  let setDate = new Date('2021-01-01');

  for (let day = 0; day < 50; day++) {
    setDate.setDate(setDate.getDate() + 1);
    let i;
    for (i = 0; i < 20; i++) {
      setDate.setMinutes(setDate.getMinutes() + 10);

      await ArchiveModel.create({
        date: setDate,
        temperature: 30,
        pH: 6.5,
        humidity: 55,
      });
    }
    setDate.setMinutes(setDate.getMinutes() - 10 * i);
  }

  console.log('Successful created!');
  process.exit();
};

const deleteRecords = async () => {
  await ArchiveModel.deleteMany();
  console.log('Successful deleted!');
  process.exit();
};

if (process.argv[2] === '--create') {
  createRecords();
}
if (process.argv[2] === '--delete') {
  deleteRecords();
}
