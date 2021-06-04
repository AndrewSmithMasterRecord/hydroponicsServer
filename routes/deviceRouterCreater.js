const express = require('express');
const deviceController = require('../controllers/deviceController');
const authController = require('../controllers/authController');

const deviceRouterCreater = ( deviceName, netHandler) => {
  const router = express.Router();
  const device = new deviceController(deviceName, netHandler);
  device.init();

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
