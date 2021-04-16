const express = require('express');
const deviceController = require('../controllers/deviceController');
const authController = require('../controllers/authController');
const fs = require('fs');
const patch = require('path');

const deviceRouterCreater = (jsonVarFile, deviceName) => {
  const router = express.Router();
  const variables = fs.readFileSync(
    patch.join(`${__dirname}`, './../devicesVariables', `${jsonVarFile}`)
  );
  const device = new deviceController(deviceName, variables);

  router.route('/view').get(device.getView.bind(device));
  router
    .route('/control')
    .get(authController.protect, device.getControl.bind(device))
    .patch(
      authController.protect,
      authController.restrictTo('admin'),
      device.updateControl.bind(device)
    );

  router.use(authController.protect, authController.restrictTo('admin'));
  router
    .route('/config')
    .get(device.getConfig.bind(device))
    .patch(device.updateConfig.bind(device));
  return router;
};

module.exports = deviceRouterCreater;
