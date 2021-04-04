const User = require('../models/userModel');
const AppError = require('../utils/appError');
const asyncCatch = require('../utils/asyncCatch');
const handlerFactory = require('./handlerFactory');

const filterObj = (obj, ...alowFields) => {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (alowFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = asyncCatch(async (req, res, next) => {
  //1) Create error if user posts passwor data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route not for password update! Please use /updatepassword',
        400
      )
    );
  }
  //2) Filter the fields names that not alowed to update
  const updateDocument = filterObj(req.body, 'name');
  //3)Update user document
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    updateDocument,
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = asyncCatch(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success!',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateFilter = (req, res, next) => {
  const filtredBody = filterObj(req.body, 'name');
  req.body = filtredBody;
  next();
};

exports.getAllUsers = handlerFactory.getAll(User);
exports.getUser = handlerFactory.getOne(User);
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);
