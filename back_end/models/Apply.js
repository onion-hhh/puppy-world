const db = require('../utils/db');
const Place = require('./Place');
const Comment = require('./Comment');
const Collect = require('./Collect');

class Apply {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.placeId = data.place_id;
    this.name = data.name;
    this.type = data.type;
    this.address = data.address;
    this.phone = data.phone;
    this.businessHours = data.business_hours;
    this.rules = data.rules;
    this.tags = data.tags;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.images = data.images;
    this.status = data.status;
    this.rejectReason = data.reject_reason;
    this.create_time = data.create_time;
    this.update_time = data.update_time;
  }

  // 创建提交记录
  static async create(applyData) {
    const [result] = await db.query(
      'INSERT INTO apply (user_id, name, type, address, phone, business_hours, rules, tags, latitude, longitude, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [applyData.userId, applyData.name, applyData.type, applyData.address, applyData.phone, applyData.businessHours, applyData.rules, applyData.tags, applyData.latitude, applyData.longitude, 0]
    );
    return result.insertId;
  }

  // 根据用户ID查询
  static async getByUserId(userId, { status }) {
    let query = 'SELECT * FROM apply WHERE user_id = ?';
    const params = [userId];

    if (status !== undefined) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY create_time DESC';

    const [rows] = await db.query(query, params);
    return rows.map(row => new Apply(row));
  }

  // 获取待审核列表
  static async getPendingList() {
    const [rows] = await db.query(
      'SELECT * FROM apply WHERE status = 0 ORDER BY create_time DESC'
    );
    return rows.map(row => new Apply(row));
  }

  // 审核
  static async audit(applyId, status, reason) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        'UPDATE apply SET status = ?, reject_reason = ? WHERE id = ?',
        [status, reason, applyId]
      );

      if (status === 1) {
        const [applyRows] = await connection.query(
          'SELECT * FROM apply WHERE id = ?',
          [applyId]
        );
        const apply = applyRows[0];

        const placeId = await Place.create({
          name: apply.name,
          type: apply.type,
          address: apply.address,
          phone: apply.phone,
          businessHours: apply.business_hours,
          rules: apply.rules,
          tags: apply.tags,
          latitude: apply.latitude,
          longitude: apply.longitude
        });

        await connection.query(
          'UPDATE apply SET place_id = ? WHERE id = ?',
          [placeId, applyId]
        );
      }

      if (status === 2) {
        await connection.query(
          'UPDATE audit_log SET final_decision = 2, reject_reason = ? WHERE apply_id = ? ORDER BY created_at DESC LIMIT 1',
          [reason, applyId]
        );
      } else if (status === 1) {
        await connection.query(
          'UPDATE audit_log SET final_decision = 1 WHERE apply_id = ? ORDER BY created_at DESC LIMIT 1',
          [applyId]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // 获取总数
  static async getCount() {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM apply');
    return rows[0].count;
  }

  // 获取待审核数量
  static async getPendingCount() {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM apply WHERE status = 0');
    return rows[0].count;
  }

  // 删除申请（级联删除相关数据）
  static async delete(applyId, userId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. 查询申请信息，判断是否已审核成功
      const [applyRows] = await connection.query(
        'SELECT status, place_id FROM apply WHERE id = ? AND user_id = ?',
        [applyId, userId]
      );

      if (applyRows.length === 0) {
        await connection.rollback();
        return false;
      }

      const apply = applyRows[0];
      const placeId = apply.place_id;

      // 2. 如果已审核成功，需要级联删除地点、评论、收藏
      if (apply.status === 1 && placeId) {
        // 删除该地点的所有收藏
        await connection.query(
          'DELETE FROM collect WHERE place_id = ?',
          [placeId]
        );

        // 删除该地点的所有评论
        await connection.query(
          'DELETE FROM comment WHERE place_id = ?',
          [placeId]
        );

        // 删除地点
        await connection.query(
          'DELETE FROM place WHERE id = ?',
          [placeId]
        );
      }

      // 3. 删除申请记录
      await connection.query(
        'DELETE FROM apply WHERE id = ? AND user_id = ?',
        [applyId, userId]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Apply;
