// routes/collect.js
const express = require('express');
const router = express.Router();
const CollectController = require('../controllers/collectController');
const auth = require('../middleware/auth');

// GET /api/collect/list - 获取我的收藏（需要认证）
router.get('/list', auth, CollectController.getMyCollects);
router.post('/toggle', auth, CollectController.toggleCollect);
router.get('/check', auth, CollectController.checkCollect);

module.exports = router;