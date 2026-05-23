// controllers/chatController.js
const axios = require('axios');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

class ChatController {
  // 流式响应接口
  static async sendMessageStream(req, res) {
    try {
      const { query } = req.body;
      const userId = req.userId;

      console.log('=== 收到流式请求 ===');
      console.log('查询内容:', query);

      if (!query) {
        return res.status(400).json({ code: 400, message: '缺少查询参数' });
      }
      if (!config.coze.botId || !config.coze.apiToken) {
        return res.status(500).json({ code: 500, message: '智能助手配置未完成' });
      }

      const requestBody = {
        bot_id: String(config.coze.botId),
        user_id: userId ? String(userId) : uuidv4(),
        stream: true,
        auto_save_history: true,
        additional_messages: [{ role: 'user', content: query, content_type: 'text' }]
      };

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.coze.apiToken}`
      };

      const cozeResponse = await axios.post(config.coze.apiUrl, requestBody, {
        headers,
        responseType: 'stream'
      });

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'X-Accel-Buffering': 'no'
      });

      let buffer = '';
      let contentBuffer = '';
      let hasSentEnd = false;  // 标记是否已发送结束信号

      cozeResponse.data.on('data', (chunk) => {
        try {
          buffer += chunk.toString('utf-8');
          const frames = buffer.split('\n\n');
          buffer = frames.pop();

          for (const frame of frames) {
            if (!frame.trim()) continue;

            let eventType = null;
            let dataStr = '';
            const lines = frame.split('\n');

            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventType = line.slice(6).trim();
              } else if (line.startsWith('data:')) {
                dataStr = line.slice(5).trim();
              }
            }

            if (dataStr) {
              try {
                const eventData = JSON.parse(dataStr);
                
                if (!eventType) {
                  eventType = eventData.event || eventData.type || 'message';
                }

                // 只处理增量内容事件，提取 content 字段（忽略 reasoning_content）
                if (eventType === 'conversation.message.delta') {
                  // 优先使用 content 字段，忽略 reasoning_content（推理过程）
                  const deltaContent = eventData.content || '';
                  if (deltaContent && !deltaContent.startsWith('{')) {
                    contentBuffer += deltaContent;
                    const sseData = JSON.stringify({ type: 'delta', content: deltaContent });
                    res.write(`data: ${sseData}\n\n`);
                    res.flush();
                  }
                }
                // 处理消息完成事件 - 发送结束信号
                else if (eventType === 'conversation.message.completed') {
                  if (!hasSentEnd) {
                    hasSentEnd = true;
                    res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
                    res.flush();
                    res.end();
                  }
                  return;
                }
                // 处理对话完成事件
                else if (eventType === 'conversation.chat.completed') {
                  if (!hasSentEnd) {
                    hasSentEnd = true;
                    res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
                    res.flush();
                    res.end();
                  }
                  return;
                }
                // 处理 done 事件
                else if (eventType === 'done') {
                  if (!hasSentEnd) {
                    hasSentEnd = true;
                    res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
                    res.flush();
                    res.end();
                  }
                  return;
                }
              } catch (parseError) {
                console.error('JSON解析错误:', parseError);
              }
            }
          }
        } catch (error) {
          console.error('处理数据错误:', error);
        }
      });

      cozeResponse.data.on('error', (error) => {
        console.error('流式响应错误:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
        res.end();
      });

      cozeResponse.data.on('end', () => {
        console.log('Coze API 响应结束');
        console.log('最终累积内容:', contentBuffer);
        console.log('是否已发送结束信号:', hasSentEnd);
        // 只有收到明确的完成事件才发送结束信号，避免提前结束
        // 如果没有收到完成事件但连接关闭了，说明可能有问题，不发送结束信号
        res.end();
      });

    } catch (error) {
      console.error('=== Coze API 调用失败 ===', error);
      if (!res.headersSent) {
        return res.status(500).json({ code: 500, message: '智能助手暂时无法响应: ' + error.message });
      }
      res.write(`data: ${JSON.stringify({ type: 'error', message: '服务异常' })}\n\n`);
      res.end();
    }
  }
}

module.exports = ChatController;