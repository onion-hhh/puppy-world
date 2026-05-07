// controllers/adminController.js
const Admin = require('../models/Admin');
const Place = require('../models/Place');
const User = require('../models/User');
const Apply = require('../models/Apply');
const jwt = require('../utils/jwt');
const bcrypt = require('../utils/bcrypt');
const result = require('../utils/result');

class AdminController {
  // 管理员登录
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.json(result.error('缺少用户名或密码', 400));
      }
      const admin = await Admin.findByUsername(username);
      if (!admin) {
        return res.json(result.error('用户名或密码错误'));
      }
      const isPasswordValid = bcrypt.verifyPassword(password, admin.password);
      if (!isPasswordValid) {
        return res.json(result.error('用户名或密码错误'));
      }
      const token = jwt.generateToken(admin.id, 'admin');
      res.json(result.success({ token, admin }));
    } catch (error) {
      res.json(result.error('登录失败'));
    }
  }

  // 获取仪表盘数据
  static async getDashboard(req, res) {
    try {
      const [placeCount, userCount, applyCount, pendingCount] = await Promise.all([
        Place.getCount(),
        User.getCount(),
        Apply.getCount(),
        Apply.getPendingCount()
      ]);
      res.json(result.success({
        placeCount,
        userCount,
        applyCount,
        pendingCount
      }));
    } catch (error) {
      res.json(result.error('获取仪表盘数据失败'));
    }
  }

  // 获取用户列表
  static async getUserList(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const users = await User.getUserList({ page, limit });
      res.json(result.success(users));
    } catch (error) {
      res.json(result.error('获取用户列表失败'));
    }
  }

  // 获取地点管理列表
  static async getPlaceList(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const places = await Place.getAdminList({ page, limit, status });
      res.json(result.success(places));
    } catch (error) {
      res.json(result.error('获取地点列表失败'));
    }
  }

  // 删除地点
  static async deletePlace(req, res) {
    try {
      const { placeId } = req.body;
      if (!placeId) {
        return res.json(result.error('缺少地点ID', 400));
      }
      const result = await Place.delete(placeId);
      res.json(result.success(result));
    } catch (error) {
      res.json(result.error('删除地点失败'));
    }
  }
}

module.exports = AdminController;