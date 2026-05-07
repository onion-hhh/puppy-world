// models/Admin.js
const db = require('../utils/db');
const bcrypt = require('../utils/bcrypt');

class Admin {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.password = data.password;
    this.nickname = data.nickname;
    this.role = data.role;
    this.status = data.status;
    this.create_time = data.create_time;
    this.update_time = data.update_time;
  }

  // 根据用户名查询
  static async findByUsername(username) {
    const [rows] = await db.query(
      'SELECT * FROM admin WHERE username = ?',
      [username]
    );
    return rows[0] ? new Admin(rows[0]) : null;
  }

  // 创建管理员
  static async create(adminData) {
    const hashedPassword = bcrypt.hashPassword(adminData.password);
    const [result] = await db.query(
      'INSERT INTO admin (username, password, nickname, role, status) VALUES (?, ?, ?, ?, ?)',
      [adminData.username, hashedPassword, adminData.nickname, adminData.role || 1, 1]
    );
    return result.insertId;
  }
}

module.exports = Admin;