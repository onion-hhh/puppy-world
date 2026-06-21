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
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await db.query(
        'INSERT INTO comment (user_id, place_id, content, score) VALUES (?, ?, ?, ?)',
        [commentData.userId, commentData.placeId, commentData.content, commentData.score]
      );

      await db.query(
        'UPDATE place SET comment_count = comment_count + 1 WHERE id = ?',
        [commentData.placeId]
      );

      await db.query(
        'UPDATE place p SET p.avg_score = (SELECT AVG(score) FROM comment WHERE place_id = p.id) WHERE p.id = ?',
        [commentData.placeId]
      );
      await conn.commit();
      return result.insertId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // 获取地点评论列表
  static async getByPlaceId(placeId) {
    const [rows] = await db.query(
      'SELECT c.*, u.nickname, u.avatar FROM comment c LEFT JOIN user u ON c.user_id = u.id WHERE c.place_id = ? ORDER BY c.create_time DESC',
      [placeId]
    );
    return rows.map(row => new Comment(row));
  }

  // 获取管理员评论列表
  static async getAdminList() {
    const [rows] = await db.query(
      `SELECT c.*, p.name as place_name
       FROM comment c
       LEFT JOIN place p ON c.place_id = p.id
       ORDER BY c.create_time DESC`
    );
    return rows;
  }

  // 获取评论总数
  static async getCount() {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM comment');
    return rows[0].count;
  }

  // 删除评论
  static async delete(commentId) {
    const [result] = await db.query('DELETE FROM comment WHERE id = ?', [commentId]);
    return result.affectedRows > 0;
  }
}

module.exports = Comment;
