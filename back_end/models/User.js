const db = require('../utils/db');

class User {
  constructor(data) {
    this.id = data.id;
    this.openid = data.openid;
    this.nickname = data.nickname;
    this.avatar = data.avatar;
    this.phone = data.phone;
    this.status = data.status;
    this.create_time = data.create_time;
    this.update_time = data.update_time;
  }

  // 创建用户
  static async create(userData) {
    const [result] = await db.query(
      'INSERT INTO user (openid, nickname, avatar, status) VALUES (?, ?, ?, ?)',
      [userData.openid, userData.nickname, userData.avatar, 1]
    );
    return result.insertId;
  }

  // 根据openid查询
  static async findByOpenid(openid) {
    const [rows] = await db.query(
      'SELECT * FROM user WHERE openid = ?',
      [openid]
    );
    return rows[0] ? new User(rows[0]) : null;
  }

  // 根据ID查询
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM user WHERE id = ?',
      [id]
    );
    return rows[0] ? new User(rows[0]) : null;
  }

  // 修改用户信息
  static async updateUser(id,userData){
    const { nickname, avatar } = userData;
    await db.query(
      'UPDATE user SET nickname = ?, avatar = ? WHERE id = ?',
      [nickname, avatar, id]
    );
  }

  // 获取用户列表
  static async getUserList() {
    const [rows] = await db.query(
      'SELECT * FROM user ORDER BY create_time DESC'
    );
    return rows.map(row => new User(row));
  }

  // 获取用户总数
  static async getCount() {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM user');
    return rows[0].count;
  }
}

module.exports = User;
