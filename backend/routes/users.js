const express = require('express');
const { body, param, query } = require('express-validator');
const { protect, restrictTo } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('role').optional().isIn(['admin', 'analyst', 'viewer']),
    query('status').optional().isIn(['active', 'inactive']),
    query('search').optional().isString(),
  ],
  getUsers
);

router.get(
  '/:id',
  [param('id').isMongoId()],
  getUserById
);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ characters'),
    body('role').optional().isIn(['admin', 'analyst', 'viewer']),
    body('status').optional().isIn(['active', 'inactive']),
  ],
  createUser
);

router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('name').optional().isString().isLength({ min: 2, max: 50 }),
    body('role').optional().isIn(['admin', 'analyst', 'viewer']),
    body('status').optional().isIn(['active', 'inactive']),
  ],
  updateUser
);

router.patch(
  '/:id/status',
  [
    param('id').isMongoId(),
    body('status').isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  ],
  updateUserStatus
);

router.delete(
  '/:id',
  [param('id').isMongoId()],
  deleteUser
);

module.exports = router;
