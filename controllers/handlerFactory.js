const asyncCatch = require('../utils/asyncCatch');
const AppError = require('../utils/appError');
const APIfeatures = require('./../utils/apiFeatures');

exports.deleteOne = (Model) =>
  asyncCatch(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document find with that id', 404));
    }
    res.status(204).json({
      status: 'success',
    });
  });

exports.updateOne = (Model) =>
  asyncCatch(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document find with that id', 404));
    }
    res.status(200).json({
      status: 'Succsess!',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  asyncCatch(async (req, res) => {
    const data = await Model.create(req.body);
    res.status(201).send({
      status: 'success',
      data: {
        data,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  asyncCatch(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;
    if (!doc) {
      return next(new AppError('No document find with that id', 404));
    }
    res.json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = Model => asyncCatch(async (req, res) => {
  //   const numTours = await Tour.countDocuments();
  //   if (skip >= numTours) throw new Error('This page does not exsist!');
  // }

  // query = query.skip(skip).limit(limit);
  let findObj = {};
  if (req.params.tourId) findObj = { tour: req.params.tourId };

  const features = new APIfeatures(Model.find(findObj), req.query)
    .filter()
    .sort()
    .limitingFields()
    .paginate();
  //EXECUTE QUERY
  const doc = await features.query;
  res.json({
    status: 'success',
    requestedAt: req.requestTime,
    results: doc.length,
    data: {
      data: doc,
    },
  });
});