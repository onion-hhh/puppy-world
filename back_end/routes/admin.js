const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// POST /api/admin/login - 管理员登录
router.post('/login', AdminController.login);

// GET /api/admin/statistics - 获取统计数据（需要管理员权限）
router.get('/statistics', auth, adminAuth, AdminController.getStatistics);

// GET /api/admin/user/list - 获取用户列表（需要管理员权限）
router.get('/user/list', auth, adminAuth, AdminController.getUserList);

// GET /api/admin/place/list - 获取地点管理列表（需要管理员权限）
router.get('/place/list', auth, adminAuth, AdminController.getPlaceList);

// POST /api/admin/place/delete - 删除地点（需要管理员权限）
router.post('/place/delete', auth, adminAuth, AdminController.deletePlace);

// GET /api/admin/comment/list - 获取评论列表（需要管理员权限）
router.get('/comment/list', auth, adminAuth, AdminController.getCommentList);

// POST /api/admin/comment/delete - 删除评论（需要管理员权限）
router.post('/comment/delete', auth, adminAuth, AdminController.deleteComment);

module.exports = router;
