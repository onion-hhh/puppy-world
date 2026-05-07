// models/Apply.js
const { query } = require('express-validator');
const db = require('../utils/db');
const Place = require('./Place');

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
      'INSERT INTO apply (user_id, name, type, address, phone, business_hours, rules, tags, latitude, longitude, images, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [applyData.userId, applyData.name, applyData.type, applyData.address, applyData.phone, applyData.businessHours, applyData.rules, applyData.tags, applyData.latitude, applyData.longitude, applyData.images, 0]
    );
    return result.insertId;
  }

  // 根据用户ID查询
  static async getByUserId(userId, { status, page, limit }) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM apply WHERE user_id = ?';
    const params = [userId];

    if (status !== undefined) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY create_time DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return rows.map(row => new Apply(row));
  }

  // 获取待审核列表
  static async getPendingList({ page, limit }) {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      'SELECT * FROM apply WHERE status = 0 ORDER BY create_time DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows.map(row => new Apply(row));
  }

  // 审核
  static async audit(applyId, status, reason) {
    // 开始事务
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 更新审核状态
      await connection.query(
        'UPDATE apply SET status = ?, reject_reason = ? WHERE id = ?',
        [status, reason, applyId]
      );

      // 如果审核通过，创建地点
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

        // 更新apply表的place_id
        await connection.query(
          'UPDATE apply SET place_id = ? WHERE id = ?',
          [placeId, applyId]
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
}

module.exports = Apply;