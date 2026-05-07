// routes/user.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const auth = require('../middleware/auth');

// POST /api/user/login - 微信登录
router.post('/login', UserController.login);

// POST /api/user/update - 修改用户信息（需要认证）
router.post('/update', auth, UserController.updateUser);



// GET /api/user/info - 获取用户信息（需要认证）
router.get('/info', auth, UserController.getUserInfo);

module.exports = router;