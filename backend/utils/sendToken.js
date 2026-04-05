const jwt = require('jsonwebtoken');

const sendToken = (user, statusCode, res) => {
  const jwtOptions = {};
  if (process.env.JWT_EXPIRE) {
    jwtOptions.expiresIn = process.env.JWT_EXPIRE;
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    jwtOptions
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  };

  if (process.env.JWT_EXPIRE) {
    cookieOptions.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  } else {
    // Long-lived cookie when JWT expiration is intentionally disabled.
    cookieOptions.expires = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000);
  }

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
        },
      },
    });
};

module.exports = { sendToken };
