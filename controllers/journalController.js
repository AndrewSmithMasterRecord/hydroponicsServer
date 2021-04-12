const JournalRecord = require('../models/jurnalModel');
const AppError = require('../utils/appError');
const asyncCatch = require('../utils/asyncCatch');
const handlerFactory = require('./handlerFactory');

//permission to current user or other by them role
exports.restrictToCurrentAnd = (...roles) =>
  asyncCatch(async (req, res, next) => {
    const record = await JournalRecord.findById(req.params.id);
    if (!record) next(new AppError('This record not exist.', 404));
    if (
      roles.includes(req.user.role) ||
      String(record.user._id) === req.user.id
    ) {
      next();
      return;
    }

    next(new AppError('This action not permit.', 400));
  });

exports.createRecord = handlerFactory.createOne(JournalRecord);
exports.updateRecord = handlerFactory.updateOne(JournalRecord);
exports.getAll = handlerFactory.getAll(JournalRecord);
exports.getOne = handlerFactory.getOne(JournalRecord);
exports.deleteOne = handlerFactory.deleteOne(JournalRecord);
