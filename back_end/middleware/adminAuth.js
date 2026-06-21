// middleware/adminAuth.js
const result = require('../utils/result');

/**
 * 管理员权限中间件
 */
module.exports = (req, res, next) => {
  console.log('adminAuth - req.role:', req.role);
  if (req.role !== 'admin') {
    return res.json(result.error('无权限操作', 403));
  }
  next();
};