// controllers/applyController.js
const Apply = require('../models/Apply');
const result = require('../utils/result');
// 引入 multer
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置 multer
const storage = multer.diskStorage({
  // 文件保存目录
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // 目录不存在则创建
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  // 文件名处理
  filename: function (req, file, cb) {
    // 生成唯一文件名：时间戳+原后缀
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `img-${uniqueSuffix}${ext}`);
  }
});

// 只允许上传图片
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型，仅支持jpg/png/webp图片'));
    }
  }
});

class ApplyController {
  // 提交地点
  static async submitApply(req, res) {
    try {
      const { name, type, address, phone, businessHours, rules, tags, images, latitude, longitude} = req.body;
      const applyData = {
        userId: req.userId,
        name,
        type,
        address,
        phone,
        businessHours,
        rules,
        tags,
        images,
        latitude,
        longitude
      };
      const applyId = await Apply.create(applyData);
      res.json(result.success({ applyId }));
    } catch (error) {
      res.json(result.error('提交失败'));
    }
  }

  // 2. 新增：图片上传接口
  static uploadImage(req, res) {
    // 用 multer 处理单文件上传
    upload.single('file')(req, res, function (err) {
      if (err) {
        return res.json(result.error(err.message));
      }
      if (!req.file) {
        return res.json(result.error('请选择要上传的图片'));
      }

      // 拼接可访问的图片地址（用你的服务器IP+端口）
      const imageUrl = `http://192.168.31.30:3000/uploads/${req.file.filename}`;
      res.json(result.success({ url: imageUrl }));
    });
  }
  
  // 获取我的提交
  static async getMyApplies(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const applies = await Apply.getByUserId(req.userId, { status, page, limit });
      res.json(result.success(applies));
    } catch (error) {
      res.json(result.error('获取提交列表失败'));
    }
  }

  // 获取待审核列表
  static async getAdminApplies(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const applies = await Apply.getPendingList({ page, limit });
      res.json(result.success(applies));
    } catch (error) {
      res.json(result.error('获取审核列表失败'));
    }
  }

  // 审核地点
  static async auditApply(req, res) {
    try {
      const { applyId, status, reason } = req.body;
      if (!applyId || !status) {
        return res.json(result.error('缺少参数', 400));
      }
      const result = await Apply.audit(applyId, status, reason);
      res.json(result.success(result));
    } catch (error) {
      res.json(result.error('审核失败'));
    }
  }
}

module.exports = ApplyController;