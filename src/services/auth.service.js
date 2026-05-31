const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/db_connection');
const { QueryTypes } = require('sequelize');

const ACCESS_TOKEN_EXPIRES_IN = '24h';

const authenticateUser = async (email, password) => {
  const query = `
    SELECT id, name, email, password, is_admin, expiry_date, active_status
    FROM tbl_users
    WHERE email = ?
    LIMIT 1
  `;

  const users = await sequelize.query(query, {
    replacements: [email],
    type: QueryTypes.SELECT
  });

  const user = users[0];

  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return null;

  if (user.active_status !== 1) return null;

  if (new Date(user.expiry_date) < new Date()) return null;

  return user;
};

const generateToken = (user) => {
  const payload = {
    sub: user.email,
    user_id: user.id,
    is_admin: user.is_admin
  };

  const authToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  });

  return {
    authToken
  };
};

const buildStatusResponse = () => {
  return {
    status: 'Running',
    project: 'Intellexa Backend',
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  authenticateUser,
  generateToken,
  buildStatusResponse
};
