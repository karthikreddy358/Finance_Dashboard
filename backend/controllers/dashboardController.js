const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter);

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpenses;

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        netBalance,
        transactionCount: transactions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCategoryBreakdown = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate } = req.query;
    const filter = { type: 'expense' };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter);

    const categoryData = {};
    transactions.forEach((t) => {
      if (categoryData[t.category]) {
        categoryData[t.category] += t.amount;
      } else {
        categoryData[t.category] = t.amount;
      }
    });

    const breakdown = Object.entries(categoryData).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / Object.values(categoryData).reduce((a, b) => a + b, 0)) * 100,
    }));

    res.status(200).json({
      success: true,
      count: breakdown.length,
      data: breakdown.sort((a, b) => b.amount - a.amount),
    });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlyTrends = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const filter = {};

    filter.date = {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    };

    const transactions = await Transaction.find(filter);

    const monthlyData = Array(12)
      .fill(null)
      .map((_, i) => ({
        month: i + 1,
        income: 0,
        expenses: 0,
      }));

    transactions.forEach((t) => {
      const month = new Date(t.date).getMonth();
      if (t.type === 'income') {
        monthlyData[month].income += t.amount;
      } else {
        monthlyData[month].expenses += t.amount;
      }
    });

    res.status(200).json({
      success: true,
      year,
      data: monthlyData,
    });
  } catch (error) {
    next(error);
  }
};
