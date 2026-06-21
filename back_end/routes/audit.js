const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const AuditAgent = require('../services/audit/AuditAgent');
const AuditLog = require('../models/AuditLog');
const result = require('../utils/result');

router.post('/review', auth, async (req, res) => {
  try {
    const auditResult = await AuditAgent.review(req.body);
    res.json(result.success(auditResult));
  } catch (error) {
    console.error('审核失败:', error);
    res.json(result.error('审核失败'));
  }
});

router.get('/logs', auth, adminAuth, async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const logs = await AuditLog.findRecentLogs(hours);
    res.json(result.success(logs));
  } catch (error) {
    console.error('获取审核日志失败:', error);
    res.json(result.error('获取审核日志失败'));
  }
});

module.exports = router;