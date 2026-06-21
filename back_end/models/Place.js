const db = require('../utils/db');

class Place {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.address = data.address;
    this.phone = data.phone;
    this.businessHours = data.business_hours;
    this.rules = data.rules;
    this.tags = data.tags;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.avgScore = data.avg_score;
    this.collectCount = data.collect_count;
    this.commentCount = data.comment_count;
    this.status = data.status;
    this.create_time = data.create_time;
    this.update_time = data.update_time;
  }

  // 创建地点
  static async create(placeData) {
    const [result] = await db.query(
      'INSERT INTO place (name, type, address, phone, business_hours, rules, tags, latitude, longitude, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [placeData.name, placeData.type, placeData.address, placeData.phone, placeData.businessHours, placeData.rules, placeData.tags, placeData.latitude, placeData.longitude, 1]
    );
    return result.insertId;
  }

  // 根据ID查询
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM place WHERE id = ?',
      [id]
    );
    return rows[0] ? new Place(rows[0]) : null;
  }

  // 根据ID列表查询
  static async getByIds(ids) {
    if (!ids || ids.length === 0) {
      return [];
    }
    const [rows] = await db.query(
      `SELECT * FROM place WHERE id IN (${ids.map(() => '?').join(',')})`,
      ids
    );
    return rows.map(row => new Place(row));
  }

  // 获取地点列表
  static async getPlaceList({ type }) {
    let query = 'SELECT id,name,address,avg_score,tags FROM place WHERE status = 1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY create_time DESC';

    const [rows] = await db.query(query, params);
    return rows.map(row => new Place(row));
  }

  // 获取管理员列表
  static async getAdminList({ status }) {
    let query = 'SELECT * FROM place';
    const params = [];

    if (status !== undefined) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY create_time DESC';

    const [rows] = await db.query(query, params);
    return rows.map(row => new Place(row));
  }

  // 获取地点总数
  static async getCount() {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM place WHERE status = 1');
    return rows[0].count;
  }

  // 删除地点（级联删除相关的收藏和评论）
  static async delete(id) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. 删除该地点的所有收藏
      await connection.query(
        'DELETE FROM collect WHERE place_id = ?',
        [id]
      );

      // 2. 删除该地点的所有评论
      await connection.query(
        'DELETE FROM comment WHERE place_id = ?',
        [id]
      );

      // 3. 删除地点本身
      const [result] = await connection.query(
        'DELETE FROM place WHERE id = ?',
        [id]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // 获取附近地点
  static async getNearbyPlaces({ lat, lng, radius, showAll }) {
    let whereSql = '';
    let params = [lat, lng, lat];

    if (!showAll) {
      whereSql = 'HAVING distance <= ?';
      params.push(radius);
    }

    const sql = `
      SELECT
        id, name, address, latitude, longitude, avg_score, tags,
        (6371000 * acos(
          cos(radians(?)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(?)) +
          sin(radians(?)) * sin(radians(latitude))
        )) AS distance
      FROM place
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      ${whereSql}
      ORDER BY distance ASC
      LIMIT 100
    `;

    const [rows] = await db.query(sql, params);
    return rows.map(row => new Place(row));
  }

  // 查找指定距离内的地点（用于重复检测）
  static async findNearby(latitude, longitude, distance) {
    const [rows] = await db.query(`
      SELECT id, type, name, address
      FROM place 
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      AND (6371000 * ACOS(
        COS(RADIANS(?)) * COS(RADIANS(latitude)) *
        COS(RADIANS(longitude) - RADIANS(?)) +
        SIN(RADIANS(?)) * SIN(RADIANS(latitude))
      )) < ?
    `, [latitude, longitude, latitude, distance]);
    
    return rows;
  }
}

module.exports = Place;
