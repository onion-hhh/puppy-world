const RuleEngine = require('./RuleEngine');
const AIReviewer = require('./AIReviewer');
const AuditLog = require('../../models/AuditLog');

class AuditAgent {
  constructor() {
    this.ruleEngine = new RuleEngine();
    this.aiReviewer = new AIReviewer();
  }

  async review(applyData) {
    const { id: applyId, ...data } = applyData;
    
    const ruleResult = await this.ruleEngine.check(data);
    
    if (ruleResult.rejected || ruleResult.score < 60) {
      const finalDecision = ruleResult.rejected ? 2 : (ruleResult.score < 60 ? 2 : 0);
      
      await this.saveAuditLog(applyId, {
        auditType: 'auto',
        ruleScore: ruleResult.score,
        aiScore: 0,
        finalScore: ruleResult.score,
        ruleResult,
        aiResult: null,
        decision: finalDecision,
        rejectReason: ruleResult.reasons.join('；')
      });
      
      return {
        decision: finalDecision,
        score: ruleResult.score,
        ruleScore: ruleResult.score,
        aiScore: 0,
        rejectReason: ruleResult.reasons.join('；') || null
      };
    }

    const aiResult = await this.aiReviewer.review(data);

    const finalScore = ruleResult.score * 0.4 + aiResult.score * 0.6;
    
    let decision, rejectReason;
    if (finalScore >= 80) {
      decision = 1;
      rejectReason = null;
    } else if (finalScore >= 60) {
      decision = 0;
      rejectReason = null;
    } else {
      decision = 2;
      rejectReason = [...ruleResult.reasons, ...aiResult.reasons].join('；');
    }

    await this.saveAuditLog(applyId, {
      auditType: 'auto',
      ruleScore: ruleResult.score,
      aiScore: aiResult.score,
      finalScore,
      ruleResult,
      aiResult,
      decision,
      rejectReason
    });

    return {
      decision,
      score: finalScore,
      ruleScore: ruleResult.score,
      aiScore: aiResult.score,
      rejectReason
    };
  }

  async saveAuditLog(applyId, data) {
    try {
      await AuditLog.create({
        apply_id: applyId,
        audit_type: data.auditType,
        rule_score: data.ruleScore,
        ai_score: data.aiScore,
        final_score: data.finalScore,
        rule_result: JSON.stringify(data.ruleResult),
        ai_result: data.aiResult ? JSON.stringify(data.aiResult) : null,
        final_decision: data.decision,
        reject_reason: data.rejectReason
      });
    } catch (error) {
      console.error('保存审核日志失败:', error);
    }
  }
}

module.exports = new AuditAgent();