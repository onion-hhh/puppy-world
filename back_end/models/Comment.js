// models/Comment.js
const db = require('../utils/db');

class Comment {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.placeId = data.place_id;
    this.content = data.content;
    this.score = data.score;
    this.createTime = data.create_time;
  }

  // 创建评论
  static async create(commentData) {
    const conn = await db.getConnection(); // 开启事务
    try {
      await conn.beginTransaction();
      const [result] = await db.query(
        'INSERT INTO comment (user_id, place_id, content, score) VALUES (?, ?, ?, ?)',
        [commentData.userId, commentData.placeId, commentData.content, commentData.score]
      );
      
      // 更新地点评论数和平均评分
      await db.query(
        'UPDATE place SET comment_count = comment_count + 1 WHERE id = ?',
        [commentData.placeId]
      );
      
      // 更新平均评分
      await db.query(
        'UPDATE place p SET p.avg_score = (SELECT AVG(score) FROM comment WHERE place_id = p.id) WHERE p.id = ?',
        [commentData.placeId]
      );
      await conn.commit(); // 提交事务
      return result.insertId;
    } catch (error) {
      await conn.rollback(); // 出错回滚
      throw error;
    } finally {
    conn.release(); // 释放连接
    }
  }

  // 获取地点评论列表
  static async getByPlaceId(placeId, { page, limit }) {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      'SELECT c.*, u.nickname, u.avatar FROM comment c LEFT JOIN user u ON c.user_id = u.id WHERE c.place_id = ? ORDER BY c.create_time DESC LIMIT ? OFFSET ?',
      [placeId, limit, offset]
    );
    return rows.map(row => new Comment(row));
  }
}

module.exports = Comment;