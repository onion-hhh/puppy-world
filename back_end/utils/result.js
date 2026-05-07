// utils/result.js
/**
 * 统一返回格式工具
 */
module.exports = {
  /**
   * 成功返回
   * @param {*} data - 返回数据
   * @param {string} message - 提示信息
   * @returns {object} 统一格式的成功响应
   */
  success(data = null, message = '成功') {
    return {
      code: 200,
      message,
      data
    };
  },

  /**
   * 错误返回
   * @param {string} message - 错误信息
   * @param {number} code - 错误代码
   * @returns {object} 统一格式的错误响应
   */
  error(message = '错误', code = 500) {
    return {
      code,
      message,
      data: null
    };
  }
};