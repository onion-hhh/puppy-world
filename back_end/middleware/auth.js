// middleware/auth.js
const jwt = require('../utils/jwt');
const result = require('../utils/result');

/**
 * JWT 认证中间件
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json(result.error('未授权访问', 401));
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verifyToken(token);
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    return res.json(result.error('Token无效或已过期', 401));
  }
};