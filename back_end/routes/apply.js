// routes/apply.js
const express = require('express');
const router = express.Router();
const ApplyController = require('../controllers/applyController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// 新增：图片上传接口（不需要登录也可以，或加auth看你需求）
router.post('/upload', ApplyController.uploadImage);
// POST /api/apply/submit - 提交地点（需要认证）
router.post('/submit', auth, ApplyController.submitApply);

// GET /api/apply/list - 获取我的提交（需要认证）
router.get('/list', auth, ApplyController.getMyApplies);

// GET /api/apply/admin/list - 获取待审核列表（需要管理员权限）
router.get('/admin/list', auth, adminAuth, ApplyController.getAdminApplies);

// POST /api/apply/admin/audit - 审核地点（需要管理员权限）
router.post('/admin/audit', auth, adminAuth, ApplyController.auditApply);

module.exports = router;