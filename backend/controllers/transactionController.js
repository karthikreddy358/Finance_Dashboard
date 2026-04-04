const Transaction = require('../models/Transaction');
const AppError = require('../middleware/AppError');
const { validationResult } = require('express-validator');

exports.getAllTransactions = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { type, category, startDate, endDate } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = new RegExp(category, 'i');

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('user', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await Transaction.findById(req.params.id)
      .populate('user', 'name email');

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, type, category, date, notes } = req.body;

    const transaction = await Transaction.create({
      user: req.user.id,
      amount,
      type,
      category,
      date: date || Date.now(),
      notes,
    });

    await transaction.populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    // Check permissions: Admin can edit all, Analyst can edit their own
    if (
      req.user.role === 'viewer' ||
      (req.user.role === 'analyst' && transaction.user.toString() !== req.user.id)
    ) {
      throw new AppError('Not authorized to update this transaction', 403);
    }

    const { amount, type, category, date, notes } = req.body;
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      { amount, type, category, date, notes },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    // Only admin can delete
    if (req.user.role !== 'admin') {
      throw new AppError('Not authorized to delete transactions', 403);
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
