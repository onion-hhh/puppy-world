const Admin = require('../models/Admin');
const Place = require('../models/Place');
const User = require('../models/User');
const Apply = require('../models/Apply');
const Comment = require('../models/Comment');
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
      res.json(result.success({ token, admin: { id: admin.id, username: admin.username } }));
    } catch (error) {
      res.json(result.error('登录失败'));
    }
  }

  // 获取统计数据
  static async getStatistics(req, res) {
    try {
      const [placeCount, userCount, applyCount, pendingCount, commentCount] = await Promise.all([
        Place.getCount(),
        User.getCount(),
        Apply.getCount(),
        Apply.getPendingCount(),
        Comment.getCount()
      ]);
      
      res.json(result.success({
        placeCount,
        userCount,
        applyCount,
        pendingCount,
        commentCount
      }));
    } catch (error) {
      console.error('getStatistics error:', error);
      res.json(result.error('获取统计数据失败'));
    }
  }

  // 获取用户列表
  static async getUserList(req, res) {
    try {
      const users = await User.getUserList();
      res.json(result.success(users));
    } catch (error) {
      res.json(result.error('获取用户列表失败'));
    }
  }

  // 获取地点管理列表
  static async getPlaceList(req, res) {
    try {
      const places = await Place.getAdminList({});
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
      const success = await Place.delete(placeId);
      res.json(result.success(success));
    } catch (error) {
      res.json(result.error('删除地点失败'));
    }
  }

  // 获取评论列表
  static async getCommentList(req, res) {
    try {
      const comments = await Comment.getAdminList();
      res.json(result.success(comments));
    } catch (error) {
      res.json(result.error('获取评论列表失败'));
    }
  }

  // 删除评论
  static async deleteComment(req, res) {
    try {
      const { commentId } = req.body;
      if (!commentId) {
        return res.json(result.error('缺少评论ID', 400));
      }
      const success = await Comment.delete(commentId);
      res.json(result.success(success));
    } catch (error) {
      res.json(result.error('删除评论失败'));
    }
  }
}

module.exports = AdminController;
