const AppError = require('../utils/appError');
const asyncCatch = require('../utils/asyncCatch');
const handlerFactory = require('./handlerFactory');
const ArchiveModel = require('../models/archiveModel');
const filterObj = require('../utils/filterObj');
const fs = require('fs');
const fsPromise = require('fs').promises;

const archiveConfig = JSON.parse(
  fs.readFileSync(`${__dirname}/../devicesVariables/archive.json`, {
    encoding: 'utf-8',
  })
);

const clearOldRecords = async (periodMonth) => {
  let filterData = new Date();
  filterData.setMonth(filterData.getMonth() - periodMonth);
  await ArchiveModel.deleteMany({ date: { $lt: filterData } });
};

const createRecord = () => {};

exports.getAll = handlerFactory.getAll(ArchiveModel);
exports.getConf = (req, res, next) => {
  if (!archiveConfig) {
    next(new AppError('it is not possible to read the config file.', 500));
  }
  res.status(200).json({
    status: 'success',
    data: archiveConfig,
  });
};

exports.setConf = asyncCatch(async (req, res, next) => {
  if (!archiveConfig) {
    next(new AppError('it is not possible to read the config file.', 500));
  }
  const newConfig = filterObj(
    req.body,
    'recordPeriodMs',
    'storageTimeMonth',
    'start'
  );

  Object.assign(archiveConfig, newConfig);

  await fsPromise.writeFile(
    `${__dirname}/../devicesVariables/archive.json`,
    JSON.stringify(archiveConfig)
  );

  res.status(200).json({
    status: 'success',
    data: archiveConfig,
  });
});

let archiveInterval;

if (archiveConfig.start) {
  archiveInterval = setInterval(createRecord, archiveConfig.recordPeriodMs);
} else {
  clearInterval(archiveInterval);
}

//Clear old records erery 24 hours
//setInterval(clearOldRecords, 24*60*60*1000);
