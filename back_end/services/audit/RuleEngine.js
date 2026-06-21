const Place = require('../../models/Place');

class RuleEngine {
  constructor() {
    this.sensitiveWords = ['色情', '暴力', '赌博', '毒品', '反动', '恐怖', '邪教'];
    this.typeMap = { 1: '公园', 2: '商场', 3: '餐厅', 4: '医院' };
    this.duplicateDistance = process.env.DUPLICATE_DISTANCE || 100;
  }

  async check(data) {
    let score = 100;
    const reasons = [];
    let rejected = false;

    if (!data.name || !data.address || !data.type) {
      score -= 20;
      reasons.push('必填字段不完整');
    }

    if (data.latitude && data.longitude) {
      const duplicates = await this.checkDuplicate(data);
      if (duplicates.exact) {
        score -= 100;
        reasons.push('该地点已存在（100米范围内相同类型）');
        rejected = true;
      } else if (duplicates.similar) {
        score -= 30;
        reasons.push('附近存在其他类型地点，需人工确认');
      }
    }

    const text = `${data.name || ''} ${data.address || ''} ${data.tags || ''}`;
    if (this.containsSensitiveWord(text)) {
      score -= 100;
      reasons.push('内容包含敏感词');
      rejected = true;
    }

    if (data.type && !this.typeMap[data.type]) {
      score -= 20;
      reasons.push('地点类型不合法');
    }

    return {
      score: Math.max(0, score),
      reasons,
      rejected
    };
  }

  async checkDuplicate(data) {
    const places = await Place.findNearby(
      data.latitude,
      data.longitude,
      this.duplicateDistance
    );

    const exact = places.some(p => p.type === data.type);
    const similar = places.length > 0 && !exact;

    return { exact, similar, count: places.length };
  }

  containsSensitiveWord(text) {
    return this.sensitiveWords.some(word => text.includes(word));
  }
}

module.exports = RuleEngine;