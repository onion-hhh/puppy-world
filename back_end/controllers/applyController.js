// controllers/applyController.js
const Apply = require('../models/Apply');
const result = require('../utils/result');
const AuditAgent = require('../services/audit/AuditAgent');

class ApplyController {
  // 提交地点
  static async submitApply(req, res) {
    try {
      const { name, type, address, phone, businessHours, rules, tags, latitude, longitude} = req.body;

      if (!name || !address || !type) {
        return res.json(result.error('缺少必填字段', 400));
      }

      const applyData = {
        userId: req.userId,
        name,
        type: parseInt(type),
        address,
        phone,
        businessHours,
        rules,
        tags,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      };

      const applyId = await Apply.create(applyData);

      // 异步执行AI审核，不阻塞响应
      setTimeout(async () => {
        try {
          const auditResult = await AuditAgent.review({
            id: applyId,
            ...applyData
          });

          if (auditResult.decision !== 0) {
            await Apply.audit(applyId, auditResult.decision, auditResult.rejectReason);
          }
          console.log(`异步审核完成 - 申请ID: ${applyId}, 结果: ${auditResult.decision === 1 ? '通过' : auditResult.decision === 2 ? '拒绝' : '待人工'}`);
        } catch (error) {
          console.error(`异步审核失败 - 申请ID: ${applyId}`, error);
        }
      }, 100);

      res.json(result.success({
        applyId,
        status: 0,
        message: '提交成功，正在审核中，请稍后查看审核结果',
        score: null
      }));
    } catch (error) {
      console.error('提交申请失败:', error);
      res.json(result.error('提交失败'));
    }
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
      await Apply.audit(applyId, status, reason);
      const message = status === 1 ? '审核通过' : '已拒绝';
      res.json(result.success(null, message));
    } catch (error) {
      console.error('审核错误:', error);
      res.json(result.error('审核失败'));
    }
  }

  // 删除申请
  static async deleteApply(req, res) {
    try {
      const { id } = req.body;
      if (!id) {
        return res.json(result.error('缺少参数', 400));
      }
      await Apply.delete(id);
      res.json(result.success(null, '删除成功'));
    } catch (error) {
      console.error('删除申请失败:', error);
      res.json(result.error('删除失败'));
    }
  }
}

module.exports = ApplyController;