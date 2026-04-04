const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getCategoryBreakdown,
  getMonthlyTrends,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const {
  query,
} = require('express-validator');

// All routes are protected
router.use(protect);

router.get(
  '/stats',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  getDashboardStats
);

router.get(
  '/categories',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  getCategoryBreakdown
);

router.get(
  '/trends',
  [query('year').optional().isInt({ min: 2000, max: 2100 })],
  getMonthlyTrends
);

module.exports = router;
