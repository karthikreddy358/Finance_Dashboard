const AppError = require('../middleware/AppError');
const errorHandler = require('../middleware/errorHandler');

describe('AppError', () => {
  test('creates operational error with status properties', () => {
    const err = new AppError('Bad request', 400);

    expect(err.message).toBe('Bad request');
    expect(err.statusCode).toBe(400);
    expect(err.status).toBe('fail');
    expect(err.isOperational).toBe(true);
  });
});

describe('errorHandler middleware', () => {
  const req = {};
  const next = jest.fn();

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    next.mockClear();
  });

  test('returns AppError status code and message', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const err = new AppError('Unauthorized', 401);
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Unauthorized',
      })
    );
  });

  test('maps JWT error to 401', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const jwtError = new Error('jwt malformed');
    jwtError.name = 'JsonWebTokenError';

    errorHandler(jwtError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid token',
      })
    );
  });
});
