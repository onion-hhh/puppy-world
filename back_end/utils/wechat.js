// utils/wechat.js
const https = require('https');
const config = require('../config');

/**
 * 微信接口工具
 */
module.exports = {
  /**
   * 通过 code 获取 openid
   * @param {string} code - 微信登录凭证
   * @returns {Promise<object>} 包含 openid 的对象
   */
  getOpenid(code) {
    return new Promise((resolve, reject) => {
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.wechat.appid}&secret=${config.wechat.appsecret}&js_code=${code}&grant_type=authorization_code`;

      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  },

  /**
   * 验证微信签名
   * @param {object} params - 验证参数
   * @returns {boolean} 签名是否有效
   */
  verifySignature(params) {
    // 这里可以实现微信签名验证逻辑
    // 具体实现参考微信官方文档
    return true;
  }
};