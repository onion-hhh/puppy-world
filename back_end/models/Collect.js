const db = require('../utils/db');

class Collect {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.placeId = data.place_id;
    this.create_time = data.create_time;
  }

  // 创建收藏
  static async create(userId, placeId) {
    try {
      const [result] = await db.query(
        'INSERT INTO collect (user_id, place_id) VALUES (?, ?)',
        [userId, placeId]
      );
      await db.query(
        'UPDATE place SET collect_count = collect_count + 1 WHERE id = ?',
        [placeId]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // 删除收藏
  static async delete(userId, placeId) {
    try {
      const [result] = await db.query(
        'DELETE FROM collect WHERE user_id = ? AND place_id = ?',
        [userId, placeId]
      );
      await db.query(
        'UPDATE place SET collect_count = collect_count - 1 WHERE id = ? AND collect_count > 0',
        [placeId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // 获取用户收藏列表
  static async getByUserId(userId) {
    const [rows] = await db.query(
      'SELECT * FROM collect WHERE user_id = ? ORDER BY create_time DESC',
      [userId]
    );
    return rows.map(row => new Collect(row));
  }

  // 检查是否已收藏
  static async isCollected(userId, placeId) {
    const [rows] = await db.query(
      'SELECT * FROM collect WHERE user_id = ? AND place_id = ?',
      [userId, placeId]
    );
    return rows.length > 0;
  }
}

module.exports = Collect;
