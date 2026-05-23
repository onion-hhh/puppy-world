// routes/chat.js
const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// 发送消息给智能体（流式响应，需要登录）
router.post('/stream', auth, ChatController.sendMessageStream);

module.exports = router;
