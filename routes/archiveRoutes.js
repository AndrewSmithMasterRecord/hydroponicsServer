const express = require('express');
const archiveController = require('../controllers/archiveController');
const authController = require('../controllers/authController');
const fs = require('fs');
const patch = require('path');

const router = express.Router();

router.route('/').get(archiveController.getAll);
router
  .route('/config')
  .get(archiveController.getConf)
  .patch(archiveController.setConf);

module.exports = router;
