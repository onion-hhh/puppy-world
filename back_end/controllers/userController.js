// controllers/userController.js
const User = require('../models/User');
const jwt = require('../utils/jwt');
const wechat = require('../utils/wechat');
const result = require('../utils/result');

class UserController {
  // 微信登录
  static async login(req, res) {
    try {
      const { code, nickname, avatar } = req.body;

      if (!code) {
        return res.json(result.error('缺少code参数', 400));
      }

      // 通过code获取openid
      const openidData = await wechat.getOpenid(code);
      if (!openidData || openidData.errcode) {
        return res.json(result.error('获取openid失败'));
      }

      const openid = openidData.openid;

      // 查询或创建用户
      let user = await User.findByOpenid(openid);
      if (!user) {
        const userId = await User.create({ openid, nickname, avatar });
        user = await User.findById(userId);
      }

      // 生成token
      const token = jwt.generateToken(user.id, 'user');

      res.json(result.success({ token, user }));
    } catch (error) {
      console.error('登录失败:', error);
      res.json(result.error('登录失败'));
    }
  }

  // 获取用户信息
  static async getUserInfo(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.json(result.error('用户不存在'));
      }
      res.json(result.success(user));
    } catch (error) {
      res.json(result.error('获取用户信息失败'));
    }
  }

  // 修改用户信息
  static async updateUser(req, res) {
    try {
      const {userId, nickname, avatar } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.json(result.error('用户不存在'));
      }
      if (nickname) {
        user.nickname = nickname;
      }
      if (avatar) {
        user.avatar = avatar;
      }
      await User.updateUser(userId,{ nickname, avatar });
      res.json(result.success({ userId }));
    } catch (error) {
      res.json(result.error('修改用户信息失败'));
    }
  }
}

module.exports = UserController;