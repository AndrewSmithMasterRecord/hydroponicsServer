const AppError = require('../utils/appError');

class DeviceController {
  constructor(deviceName, controlVariables) {
    this.variables = JSON.parse(controlVariables), (this.deviceName = deviceName);
  }
  filterRequestBody = (object, valuesObj) => {
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
  }
  sendData(res, data) {
    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
  updateVariablesObject(varObj, objToUpdate) {
    let updateArray = Object.keys(objToUpdate);
    let key;
    for (key in varObj) {
      if (updateArray.includes(key)) varObj[key] = objToUpdate[key];
    }
  }
  getView = (req, res, next) => {
    this.sendData(res, this.variables.view);
  };

  getControl(req, res, next) {
    this.sendData(res, this.variables.control);
  }

  getConfig(req, res, next) {
    this.sendData(res, this.variables.config);
  }

  updateControl(req, res, next) {
    if (!req.body) {
      next(new AppError('Empty request object!', 400));
    }
    let reqObj = this.filterRequestBody(req.body, this.variables.control);
    if (!reqObj) {
      next(new AppError('Empty or incorrect parametrs!', 400));
    }

    //Здесь будет обмен данными с устройством

    this.updateVariablesObject(this.variables.control, reqObj);
    this.sendData(res, reqObj);
  }
  
  updateConfig = (req, res, next) => {
    if (!req.body) {
      next(new AppError('Empty request object!', 400));
    }
    let reqObj = this.filterRequestBody(req.body, this.variables.config);
    if (!reqObj) {
      next(new AppError('Empty or incorrect parametrs!', 400));
    }

    //Здесь будет обмен данными с устройством

    this.updateVariablesObject(this.variables.config, reqObj);
    this.sendData(res, reqObj);
  };
}

module.exports = DeviceController;