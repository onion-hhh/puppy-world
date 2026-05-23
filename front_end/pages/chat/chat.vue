<template>
  <view class="chat-container">
    <!-- 消息列表 -->
    <scroll-view
      class="message-list"
      scroll-y
      :scroll-with-animation="true"
      :enhanced="true"
      :show-scrollbar="false"
    >
      <view
        v-for="msg in messages"
        :key="msg.id"
        :id="'msg-' + msg.id"
        class="message-item"
        :class="[msg.type === 'user' ? 'user' : 'bot']"
      >
        <view class="avatar">{{ msg.type === 'user' ? 'U' : 'B' }}</view>
        <view class="content">
          <view v-if="msg.isThinking" class="thinking">
            <text class="dot"></text>
            <text class="dot delay-1"></text>
            <text class="dot delay-2"></text>
          </view>
          <text v-else>{{ msg.content }}</text>
        </view>
      </view>
    </scroll-view>
    <!-- 输入框 -->
    <view class="input-area">
      <input 
        v-model="inputText" 
        placeholder="请输入问题" 
        @confirm="send" 
      />
      <button @tap="send">
        发送
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      messages: [],
      inputText: "",
      msgId: 0,
      scrollToView: "",
      isLoading: false,
      currentBotMsgId: null,
      streamBuffer: "",
      hasReceivedContent: false
    };
  },
  onLoad() {
    this.messages.push({
      id: ++this.msgId,
      type: "bot",
      content: "你好！我是汪汪世界智能助手，有什么可以帮你的？"
    });
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    // 发送消息（真正的流式响应）
    send() {
      if (!this.inputText.trim() || this.isLoading) return;
      const text = this.inputText;
      this.inputText = "";

      // 加入用户消息
      this.messages.push({
        id: ++this.msgId,
        type: "user",
        content: text
      });

      this.isLoading = true;
      this.streamBuffer = "";
      this.hasReceivedContent = false;  // 标记是否收到过增量内容

      // 创建机器人消息占位（显示 thinking... 效果）
      this.currentBotMsgId = ++this.msgId;
      this.messages.push({
        id: this.currentBotMsgId,
        type: "bot",
        content: "",
        isThinking: true
      });

      const token = uni.getStorageSync('token');

      // 使用 wx.request 实现真正的流式响应
      const requestTask = wx.request({
        url: "http://localhost:3000/api/chat/stream",
        header: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        data: JSON.stringify({
          query: text
        }),
        method: "POST",
        enableChunked: true,
        responseType: "arraybuffer",
        
        // 使用标准的 success/fail 回调
        success: (res) => {
          console.log('请求成功:', res);
        },
        
        fail: (err) => {
          console.error('请求失败:', err);
          this.isLoading = false;
          const botMsg = this.messages.find(m => m.id === this.currentBotMsgId);
          if (botMsg) {
            botMsg.isThinking = false;
            botMsg.content = "服务繁忙，请稍后再试。";
          }
        },
        complete: () => {
          console.log('请求完成');
        }
      });

      // 监听分块数据（流式响应核心）- 检查方法是否存在
      if (typeof requestTask.onChunkReceived === 'function') {
        requestTask.onChunkReceived((res) => {
          this.handleChunkData(res);
        });
      } else {
        // 如果不支持流式，使用模拟打字效果
        console.warn('当前环境不支持 onChunkReceived');
      }
    },
    // 分块数据处理（SSE格式解析）
    handleChunkData(res) {
      try {
        console.log('收到分块数据:', res);
        // ArrayBuffer 转字符串
        let rawStr = "";
        try {
          rawStr = new TextDecoder("utf-8").decode(res.data);
        } catch (e) {
          rawStr = Array.from(new Uint8Array(res.data))
            .map((byte) => String.fromCharCode(byte))
            .join("");
          rawStr = unescape(encodeURIComponent(rawStr));
        }

        console.log('解析后的字符串:', rawStr);
        // 追加到缓冲区
        this.streamBuffer += rawStr;
        
        // 按 SSE 格式解析（按 \n\n 分割事件）
        const events = this.streamBuffer.split("\n\n");
        // 保留最后一个不完整的事件
        this.streamBuffer = events.pop() || "";

        for (const event of events) {
          if (!event.trim()) continue;

          let dataStr = "";
          const lines = event.split("\n");
          
          for (const line of lines) {
            if (line.startsWith("data:")) {
              dataStr = line.slice(5).trim();
            }
          }

          if (dataStr) {
            try {
              const parsed = JSON.parse(dataStr);
              console.log('解析的JSON:', parsed);
              
              if (parsed.type === 'delta' && parsed.content) {
                // 增量内容，实时更新
                this.hasReceivedContent = true;  // 标记已收到内容
                const botMsg = this.messages.find(m => m.id === this.currentBotMsgId);
                if (botMsg) {
                  botMsg.isThinking = false;
                  botMsg.content += parsed.content;
                }
              } else if (parsed.type === 'end') {
                // 结束信号 - 直接重置加载状态
                console.log('流式响应结束');
                this.isLoading = false;
                this.hasReceivedContent = false;  // 重置标记，准备下次对话
              } else if (parsed.type === 'error') {
                // 错误处理
                const botMsg = this.messages.find(m => m.id === this.currentBotMsgId);
                if (botMsg) {
                  botMsg.isThinking = false;
                  botMsg.content = parsed.message || "服务出错";
                }
              } else if (parsed.content) {
                // 兼容其他格式
                const botMsg = this.messages.find(m => m.id === this.currentBotMsgId);
                if (botMsg) {
                  botMsg.isThinking = false;
                  botMsg.content += parsed.content;
                }
              }
            } catch (e) {
              console.error('JSON解析错误:', e);
              // 如果不是JSON，尝试直接显示
              const botMsg = this.messages.find(m => m.id === this.currentBotMsgId);
              if (botMsg) {
                botMsg.isThinking = false;
                botMsg.content += dataStr;
              }
            }
          }
        }
      } catch (e) {
        console.error('数据处理异常:', e);
      }
    }
  }
};
</script>

<style scoped>

.chat-container {
  display: flex;
  height: 100vh;
  background: #f8f9fa;
}

.message-list {
  flex: 1;
  padding-bottom: 140rpx;
  padding-top: 10rpx;
  flex-direction: column;
}

.message-item {
  display: flex;
  margin-bottom: 30rpx;
}

.message-item.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
}

.user .avatar {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  margin-left: 16rpx;
}

.bot .avatar {
  background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
  margin-right: 16rpx;
}

.content {
  max-width: 70%;
  padding: 24rpx;
  border-radius: 24rpx;
  line-height: 1.6;
  font-size: 28rpx;
  word-break: break-word;
}

.user .content {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: #fff;
  border-bottom-right-radius: 8rpx;
}

.bot .content {
  background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
  color: #fff;
  border-bottom-left-radius: 8rpx;
}

/* thinking 效果 */
.thinking {
  display: flex;
  align-items: center;
  height: 40rpx;
}

.thinking .dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #e5e5e5;
  margin-right: 8rpx;
  animation: bounce 1.4s infinite ease-in-out;
}

.thinking .dot.delay-1 {
  animation-delay: 0.2s;
}

.thinking .dot.delay-2 {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 输入区域 */
.input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.input-area input {
  flex: 1;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.input-area input[disabled] {
  opacity: 0.6;
  color: #999;
}

.input-area button {
  width: 120rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
  border-radius: 40rpx;
  color: #fff;
  font-size: 28rpx;
  border: none;
}

.input-area button[disabled] {
  opacity: 0.5;
}
</style>