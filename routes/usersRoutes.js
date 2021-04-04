const express = require('express');
const usersController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.sign);
router.patch('/updateMe', authController.protect, usersController.updateMe);
router.get(
  '/me',
  authController.protect,
  usersController.getMe,
  usersController.getUser
);

//Only admin routes
router.use(authController.protect, authController.restrictTo('admin'));

router.post('/createUser', authController.signup);
router.patch('/:id/updatePassword', authController.updatePassword);
router.route('/').get(usersController.getAllUsers);
router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateFilter, usersController.updateUser)
  .delete(usersController.deleteUser);
module.exports = router;
