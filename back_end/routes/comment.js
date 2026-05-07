// routes/comment.js
const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

// POST /api/comment/add - 添加评论（需要认证）
router.post('/add', auth, CommentController.addComment);

// GET /api/comment/list - 获取地点评论
router.get('/list', CommentController.getComments);

module.exports = router;