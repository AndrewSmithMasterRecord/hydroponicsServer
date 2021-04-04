const AppError = require('../utils/appError');

const variables = {
  view: {
    state: 0,
    flowSpeed: 0,
    timer: 0,
    alarms: 0,
  },
  control: {
    block: false,
    manual: false,
    onOffManual: false,
    timerSet: 0,
  },
  config: {
    jobMode: 0,
    levelSensorSelect: 0,
    timeToLevelAlarm: 0,
    flowSensorSelect: 0,
    impulsesPerLiter: 0,
    timeToFlowAlarm: 0,
    maxFlowRange: 0,
    minFlowRange: 0,
    load: 0,
  },
};

const filterRequestBody = (object, valuesObj) => {
  const alowedValues = Object.keys(valuesObj);
  const filtredObj = {};
  Object.keys(object).forEach((el) => {
    if (alowedValues.includes(el)) filtredObj[el] = object[el];
  });
  if (Object.keys(filtredObj).length === 0) {
    return null;
  } else {
    return filtredObj;
  }
};

const sendData = (res, data) => {
  res.status(200).json({
    status: 'success',
    data: data,
  });
};

const updateVariablesObject = (varObj, objToUpdate) => {
  let updateArray = Object.keys(objToUpdate);
  for (key in varObj) {
    if (updateArray.includes(key)) varObj[key] = objToUpdate[key];
  }
};

exports.getView = (req, res, next) => {
  sendData(res, variables.view);
};

exports.getControl = (req, res, next) => {
  sendData(res, variables.control);
};

exports.getConfig = (req, res, next) => {
  sendData(res, variables.config);
};

exports.updateControl = (req, res, next) => {
  if (!req.body) {
    next(new AppError('Empty request object!', 400));
  }
  let reqObj = filterRequestBody(req.body, variables.control);
  console.log(reqObj);
  if (!reqObj) {
    next(new AppError('Empty or incorrect parametrs!', 400));
  }

  //Здесь будет обмен данными с устройством

  updateVariablesObject(variables.control, reqObj);
  sendData(res, reqObj);
};

exports.updateConfig = (req, res, next) => {
  if (!req.body) {
    next(new AppError('Empty request object!', 400));
  }
  let reqObj = filterRequestBody(req.body, variables.config);
  console.log(reqObj);
  if (!reqObj) {
    next(new AppError('Empty or incorrect parametrs!', 400));
  }

  //Здесь будет обмен данными с устройством

  updateVariablesObject(variables.config, reqObj);
  sendData(res, reqObj);
};
