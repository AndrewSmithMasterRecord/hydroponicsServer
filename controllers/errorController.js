const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateErrorDB = (err) => {
  const message = `Duplicate field  val: ${err.message.match(
    /".+"/
  )} Please use another value`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  let values = Object.values(err.errors)
    .map((el) => el.message)
    .join('  ');
  let message = `Invalid input data: ${values}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenERR = (err) => {
  return new AppError('Invalid token! Please log in again.', 401);
};
const handleJWTexpiredError = (err) =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    err: err,
  });
};
const sendErrProd = (err, res) => {
  //Operationals errors
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //programming unknown errors
  } else {
    //1) Log error
    console.error('ERROR :triangular_flag_on_post:', err);
    //2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Oups ... something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message };
    if (err.kind === 'ObjectId') {
      error = handleCastErrorDB(error);
    }
    if (err.code === 11000 && err.driver === true) {
      error = handleDuplicateErrorDB(error);
    }
    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handleJsonWebTokenERR(error);
    }
    if (err.name === 'TokenExpiredError') error = handleJWTexpiredError(error);
    sendErrProd(error, res);
  }
};
