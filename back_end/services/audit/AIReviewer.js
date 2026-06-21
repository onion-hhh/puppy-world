const { ChatOpenAI } = require('@langchain/openai');

class AIReviewer {
  constructor() {
    // DeepSeek API配置
    this.model = new ChatOpenAI({
      modelName: process.env.OPENAI_MODEL || 'minimaxai/minimax-m2.7',
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0.3,
      maxTokens: 500,
      // DeepSeek API的baseURL
      configuration: {
        baseURL: 'https://integrate.api.nvidia.com/v1'
      }
    });

    this.typeMap = { 1: '公园', 2: '商场', 3: '餐厅', 4: '医院' };
  }

  async review(data) {
    try {
      const typeName = this.typeMap[data.type] || '未知';
      
      // 直接构建prompt，避免模板语法冲突
      const prompt = `你是一个宠物友好地点审核专家，请对以下地点申请进行审核：

【地点信息】
名称：${data.name || ''}
地址：${data.address || ''}
类型：${typeName}（类型代码：${data.type || 0}）
标签：${data.tags || ''}

【审核要求】
请从以下维度综合评估（每项0-100分）：
1. 名称合理性：名称是否清晰、符合地点类型
2. 地址完整性：地址是否完整可定位
3. 类型匹配度：名称与所选类型是否匹配
4. 内容合规性：是否存在违规或不当内容

【评分标准】
- 90-100分：完全符合要求
- 70-89分：基本符合
- 60-69分：存在疑问
- 0-59分：不符合要求

【输出格式】
请用JSON格式输出，包含score（综合评分0-100，整数）和reasons（问题原因数组），例如：
{"score": 85, "reasons": ["名称与类型匹配"]}`;

      const response = await this.model.invoke(prompt);

      try {
        const result = JSON.parse(response.content);
        return {
          score: Math.min(100, Math.max(0, parseInt(result.score) || 0)),
          reasons: result.reasons || []
        };
      } catch {
        return {
          score: 75,
          reasons: ['AI审核解析失败']
        };
      }
    } catch (error) {
      console.error('AI审核失败:', error);
      return {
        score: 60,
        reasons: ['AI审核服务异常']
      };
    }
  }
}

module.exports = AIReviewer;