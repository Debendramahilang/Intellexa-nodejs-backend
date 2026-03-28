const AuthService = require('../services/auth.service');

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

    res.cookie('access_token', tokenData.access_token, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
      sameSite: 'lax',
      secure: false
    });

    return res.json({
      ...tokenData,
      message: 'Login successful. Token set in cookie.'
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
  res.clearCookie('access_token');
  return res.json({ message: 'Logged out successfully' });
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