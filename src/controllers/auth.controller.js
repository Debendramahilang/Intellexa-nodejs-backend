const AuthService = require('../services/auth.service');

const AUTH_COOKIE_NAME = 'authToken';
const LEGACY_AUTH_COOKIE_NAME = 'access_token';
const AUTH_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;
const AUTH_COOKIE_OPTIONS = {
  path: '/',
  maxAge: AUTH_COOKIE_MAX_AGE,
  sameSite: 'lax',
  secure: false
};
const CLEAR_AUTH_COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax',
  secure: false
};

// GET /status
const getStatus = (req, res) => {
  const status = AuthService.buildStatusResponse();
  return res.status(200).json(status);
};

// POST /login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await AuthService.authenticateUser(email, password);

    if (!user) {
      return res.status(401).json({
        message: 'Incorrect email or password'
      });
    }

    const tokenData = AuthService.generateToken(user);

    res.clearCookie(LEGACY_AUTH_COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS);
    res.cookie(AUTH_COOKIE_NAME, tokenData.authToken, AUTH_COOKIE_OPTIONS);

    return res.json({
      authToken: tokenData.authToken
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// POST /logout
const logout = (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS);
  res.clearCookie(LEGACY_AUTH_COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS);

  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// GET /me
const getMe = (req, res) => {
  const user = req.user;

  return res.json({
    id: user.user_id,
    email: user.sub,
    is_admin: user.is_admin
  });
};

module.exports = {
  getStatus,
  login,
  logout,
  getMe
};
