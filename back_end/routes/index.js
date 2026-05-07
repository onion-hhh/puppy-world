// routes/index.js
const express = require('express');
const router = express.Router();

// 导入各个路由模块
const userRouter = require('./user');
const placeRouter = require('./place');
const applyRouter = require('./apply');
const collectRouter = require('./collect');
const commentRouter = require('./comment');
const adminRouter = require('./admin');

// 健康检查接口
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '服务器运行正常'
  });
});

// 注册路由
router.use('/user', userRouter);
router.use('/place', placeRouter);
router.use('/apply', applyRouter);
router.use('/collect', collectRouter);
router.use('/comment', commentRouter);
router.use('/admin', adminRouter);

module.exports = router;