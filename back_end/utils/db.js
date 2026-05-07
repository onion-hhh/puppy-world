// utils/db.js
const mysql = require('mysql2/promise');
const config = require('../config');

// 创建数据库连接池
const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    connection.release();
  } catch (error) {
    console.error('数据库连接失败:', error.message);
  }
}

// 导出连接池
module.exports = pool;

// 导出测试函数（可选）
module.exports.testConnection = testConnection;