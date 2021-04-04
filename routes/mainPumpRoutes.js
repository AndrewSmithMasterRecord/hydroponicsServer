const express = require('express');
const mainPumpController = require('../controllers/mainPumpController');

const router = express.Router();

router.route('/view').get(mainPumpController.getView);
router
  .route('/control')
  .get(mainPumpController.getControl)
  .patch(mainPumpController.updateControl);

router
  .route('/config')
  .get(mainPumpController.getConfig)
  .patch(mainPumpController.updateConfig);

module.exports = router;