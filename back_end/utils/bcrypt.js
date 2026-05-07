// utils/bcrypt.js
const bcrypt = require('bcryptjs');

/**
 * 密码加密工具
 */
module.exports = {
  /**
   * 加密密码
   * @param {string} password - 原始密码
   * @returns {string} 加密后的密码
   */
  hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  },

  /**
   * 验证密码
   * @param {string} password - 原始密码
   * @param {string} hashedPassword - 加密后的密码
   * @returns {boolean} 密码是否正确
   */
  verifyPassword(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
  }
};