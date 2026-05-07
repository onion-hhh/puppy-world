// controllers/commentController.js
const Comment = require('../models/Comment');
const result = require('../utils/result');

class CommentController {
  // 添加评论
  static async addComment(req, res) {
    try {
      const { placeId, content, score } = req.body;
      if (!placeId || !content) {
        return res.json(result.error('缺少参数', 400));
      }
      const commentId = await Comment.create({
        userId: req.userId,
        placeId,
        content,
        score
      });
      res.json(result.success({ commentId }));
    } catch (error) {
      res.json(result.error('评论失败'));
    }
  }

  // 获取地点评论
  static async getComments(req, res) {
    try {
      const { placeId, page = 1, limit = 10 } = req.query;
      if (!placeId) {
        return res.json(result.error('缺少地点ID', 400));
      }
      const comments = await Comment.getByPlaceId(placeId, { page, limit });
      res.json(result.success(comments));
    } catch (error) {
      res.json(result.error('获取评论失败'));
    }
  }
}

module.exports = CommentController;