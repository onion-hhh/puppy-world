// utils/jwt.js
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * JWT 工具函数
 */
module.exports = {
  /**
   * 生成 token
   * @param {number} userId - 用户ID
   * @param {string} role - 用户角色
   * @returns {string} JWT token
   */
  generateToken(userId, role) {
    return jwt.sign(
      { userId, role },
      config.jwt.secret,
      { expiresIn: config.jwt.expire + 's' }
    );
  },

  /**
   * 验证 token
   * @param {string} token - JWT token
   * @returns {object} 解码后的 token 信息
   * @throws {Error} token 无效时抛出错误
   */
  verifyToken(token) {
    return jwt.verify(token, config.jwt.secret);
  },

  /**
   * 从 token 中提取用户信息
   * @param {string} token - JWT token
   * @returns {object} 用户信息 {userId, role}
   */
  getInfoFromToken(token) {
    try {
      const decoded = this.verifyToken(token);
      return {
        userId: decoded.userId,
        role: decoded.role
      };
    } catch (error) {
      return null;
    }
  }
};