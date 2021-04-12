const journalController = require('../controllers/journalController');
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(journalController.getAll)
  .post(journalController.createRecord);

router
  .route('/:id')
  .get(journalController.getOne)
  .patch(journalController.restrictToCurrentAnd('admin'), journalController.updateRecord)
  .delete(journalController.restrictToCurrentAnd('admin'), journalController.deleteOne);

module.exports = router;
