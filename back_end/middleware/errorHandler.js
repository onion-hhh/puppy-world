// middleware/errorHandler.js
const result = require('../utils/result');

/**
 * 全局错误处理中间件
 */
module.exports = (err, req, res, next) => {
  console.error('错误:', err);
  
  // 处理不同类型的错误
  if (err.name === 'ValidationError') {
    return res.json(result.error(err.message, 400));
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.json(result.error('未授权访问', 401));
  }
  
  if (err.code === 'ECONNREFUSED') {
    return res.json(result.error('数据库连接失败', 503));
  }
  
  // 其他错误
  return res.json(result.error(err.message || '服务器内部错误'));
};