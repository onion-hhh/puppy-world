const db = require('../utils/db');

class AuditLog {
  static async create(data) {
    const {
      apply_id,
      audit_type,
      rule_score,
      ai_score,
      final_score,
      rule_result,
      ai_result,
      final_decision,
      reject_reason
    } = data;

    const [result] = await db.execute(
      'INSERT INTO audit_log (apply_id, audit_type, rule_score, ai_score, final_score, rule_result, ai_result, final_decision, reject_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [apply_id, audit_type, rule_score, ai_score, final_score, rule_result, ai_result, final_decision, reject_reason]
    );

    return result.insertId;
  }

  static async findByApplyId(applyId) {
    const [rows] = await db.execute('SELECT * FROM audit_log WHERE apply_id = ? ORDER BY created_at DESC', [applyId]);
    return rows;
  }

  static async findRecentLogs(hours = 168) {
    const [rows] = await db.execute(
      'SELECT al.*, a.name, a.type, a.address, a.status FROM audit_log al LEFT JOIN apply a ON al.apply_id = a.id WHERE al.created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR) ORDER BY al.created_at DESC',
      [hours]
    );
    return rows;
  }
}

module.exports = AuditLog;