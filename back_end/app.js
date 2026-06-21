// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const config = require('./config');

// 导入中间件
const errorHandler = require('./middleware/errorHandler');

// 跨域配置
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 解析URL编码的请求体
app.use(express.urlencoded({ extended: true }));



// 静态文件服务（上传的图片）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 导入路由
const indexRouter = require('./routes/index');
app.use('/api', indexRouter);

// 审核路由
const auditRouter = require('./routes/audit');
app.use('/api/audit', auditRouter);

// 直接添加删除申请接口（测试）
const ApplyController = require('./controllers/applyController');
const auth = require('./middleware/auth');
app.post('/api/apply/delete', auth, ApplyController.deleteApply);

// 全局错误处理
app.use(errorHandler);

// 启动服务器
app.listen(config.port, '0.0.0.0',() => {
  console.log(`服务器运行在 http://localhost:${config.port}`);
  const db = require('./utils/db');
  db.testConnection();
});

module.exports = app;