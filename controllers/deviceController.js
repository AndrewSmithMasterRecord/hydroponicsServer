const AppError = require('../utils/appError');
const asyncCatch = require('../utils/asyncCatch');

class DeviceController {
  constructor(deviceName,  netHandler) {
    this.deviceName = deviceName;
    this.netHandler = netHandler;
  }

  variables = {
    view: {},
    control: {},
    config: {},
    error: '',
  };

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
  };
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
    if (this.variables.error != '') {
      return next(new AppError(`${this.variables.error}`, 500));
    }
    this.sendData(res, this.variables.view);
  };

  getControl = asyncCatch(async (req, res, next) => {
    if (this.variables.error != '') {
      return next(new AppError(`${this.variables.error}`, 500));
    }

    this.variables.control = await this.netHandler.readData(
      this.deviceName,
      'control'
    );
    this.sendData(res, this.variables.control);
  });

  getConfig = asyncCatch(async (req, res, next) => {
    if (this.variables.error != '') {
      return next(new AppError(`${this.variables.error}`, 500));
    }

    this.variables.config = await this.netHandler.readData(
      this.deviceName,
      'config'
    );
    this.sendData(res, this.variables.config);
  });

  updateControl = asyncCatch(async (req, res, next) => {
    if (!req.body) {
      return next(new AppError('Empty request object!', 400));
    }

    await this.netHandler.setData(this.deviceName, req.body);//устанавливаем новое значение
    this.variables.control = await this.netHandler.readData(//читаем всю секцию
      this.deviceName,
      'control'
    );
    this.sendData(res, this.variables.control);//отдаем всю секцию
  });

  updateConfig = asyncCatch( async (req, res, next) => {
    if (!req.body) {
      next(new AppError('Empty request object!', 400));
    }
    await this.netHandler.setData(this.deviceName, req.body);
    this.variables.config = await this.netHandler.readData(
      this.deviceName,
      'config'
    );

    this.sendData(res, this.variables.config);
  });

  init = () => { //инициализация автоматического обновления переменных каждую секунду
    setInterval(async () => {
      try {
        this.variables.view = await this.netHandler.readData(
          this.deviceName,
          'view'
        );
        this.variables.error = '';
      } catch (error) {
        this.variables.error = error.message;
      }
    }, 1000);
  };
}

module.exports = DeviceController;
