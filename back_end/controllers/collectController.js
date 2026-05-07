// controllers/collectController.js
const Collect = require('../models/Collect');
const Place = require('../models/Place');
const result = require('../utils/result');

class CollectController {
  // 获取我的收藏
  static async getMyCollects(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const collects = await Collect.getByUserId(req.userId, { page, limit });
      // 获取收藏的地点详情
      const placeIds = collects.map(item => item.placeId);
      const places = await Place.getByIds(placeIds);
      res.json(result.success({ collects, places }));
    } catch (error) {
      res.json(result.error('获取收藏列表失败'));
    }
  }

   // 2. 检查是否已收藏（详情页刚进入时用）
  static async checkCollect(req, res) {
    try {
      const { userId, placeId } = req.query;
      const isCollected = await Collect.isCollected(userId, placeId);
      res.json(result.success({ isCollected }));
    } catch (error) {
      res.json(result.error('检查收藏失败'));
    }
  }

  // 3. 收藏 / 取消收藏（核心接口）
  static async toggleCollect(req, res) {
    try {
      const { userId, placeId } = req.body;

      // 检查是否已经收藏
      const already = await Collect.isCollected(userId, placeId);

      if (already) {
        // 取消收藏
        await Collect.delete(userId, placeId);
        res.json(result.success(null, '取消收藏成功'));
      } else {
        // 添加收藏
        await Collect.create(userId, placeId);
        res.json(result.success(null, '收藏成功'));
      }
    } catch (error) {
      res.json(result.error('操作失败'));
    }
  }
}

module.exports = CollectController;