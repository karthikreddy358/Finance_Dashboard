const express = require('express');
const router = express.Router();
const {
  getAllTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { protect, restrictTo } = require('../middleware/auth');
const {
  body,
  param,
  query,
} = require('express-validator');

const transactionValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

// All routes are protected
router.use(protect);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('type').optional().isIn(['income', 'expense']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  getAllTransactions
);

router.get(
  '/:id',
  param('id').isMongoId(),
  getTransaction
);

router.post(
  '/',
  restrictTo('admin', 'analyst'),
  transactionValidation,
  createTransaction
);

router.put(
  '/:id',
  restrictTo('admin', 'analyst'),
  [
    param('id').isMongoId(),
    ...transactionValidation,
  ],
  updateTransaction
);

router.delete(
  '/:id',
  restrictTo('admin'),
  param('id').isMongoId(),
  deleteTransaction
);

module.exports = router;
