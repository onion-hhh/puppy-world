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
        :disabled="isLoading"
      />
      <button @tap="send" :disabled="isLoading">
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
      requestTask: null,
      typingInterval: null
    };
  },
  onLoad() {
    this.messages.push({
      id: ++this.msgId,
      type: "bot",
      content: "你好！我是汪汪世界智能助手，有什么可以帮你的？"
    });
  },
  onUnload() {
    // 1. 终止流式网络请求
    if (this.requestTask && typeof this.requestTask.abort === 'function') {
      this.requestTask.abort();
    }
    this.requestTask = null;
  
    // 2. 强制清除打字动画定时器（双重兜底）
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
    // 额外兜底：全局延时定时器预留销毁位
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  
    // 3. 清空状态，阻断后续异步分片回调读写页面数据
    this.isLoading = false;
    this.currentBotMsgId = null;
    this.streamBuffer = "";
    this.messages = [];
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    // 发送消息（流式响应）
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

      // 创建机器人消息占位（显示 thinking... 效果）
      this.currentBotMsgId = ++this.msgId;
      this.messages.push({
        id: this.currentBotMsgId,
        type: "bot",
        content: "",
        isThinking: true
      });
      const token = uni.getStorageSync('token');
	  
      // 使用 wx.request 实现流式响应
      this.requestTask = wx.request({
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
        responseType: "text",
        
        success: (res) => {
          console.log('请求成功:', res);
        },
        
        fail: (err) => {
          console.error('请求失败:', err);
          this.handleRequestError();
        },
        complete: () => {
          console.log('请求完成');
        }
      });
      // 尝试使用流式响应
      if (typeof this.requestTask.onChunkReceived === 'function') {
        // 支持流式响应
        this.requestTask.onChunkReceived((res) => {
          this.handleChunkData(res);
        });
      } else {
        // 不支持流式，使用轮询方式读取响应
        console.warn('当前环境不支持 onChunkReceived，使用降级方案');
        this.startResponsePolling(text);
      }
    },
    // 处理分块数据
    handleChunkData(res) {
      try {
        const rawStr = typeof res.data === 'string' ? res.data : 
          (res.data instanceof ArrayBuffer ? new TextDecoder("utf-8").decode(res.data) : String(res.data));
        
        this.streamBuffer += rawStr;
        
        // 按 SSE 格式解析
        const events = this.streamBuffer.split("\n\n");
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
              
              if (parsed.type === 'delta' && parsed.content) {
                const botMsg = this.messages.find(m => m.id === this.currentBotMsgId);
                if (botMsg) {
                  botMsg.isThinking = false;
                  botMsg.content += parsed.content;
                }
              } else if (parsed.type === 'end') {
                this.isLoading = false;
              } else if (parsed.type === 'error') {
                const botMsg = this.messages.find(m => m.id === this.currentBotMsgId);
                if (botMsg) {
                  botMsg.isThinking = false;
                  botMsg.content = parsed.message || "服务出错";
                }
                this.isLoading = false;
              }
            } catch (e) {
              console.error('JSON解析错误:', e);
            }
          }
        }
      } catch (e) {
        console.error('数据处理异常:', e);
      }
    },
    // 打字效果（降级方案用）
    showTypingEffect(content) {
      const botMsg = this.messages.find(m => m.id === this.currentBotMsgId);
      if (!botMsg) return;

      botMsg.isThinking = false;
      botMsg.content = "";

      let index = 0;
      const speed = 50;

      if (this.typingInterval) {
        clearInterval(this.typingInterval);
      }

      this.typingInterval = setInterval(() => {
        if (index < content.length) {
          botMsg.content += content[index];
          index++;
        } else {
          clearInterval(this.typingInterval);
          this.typingInterval = null;
          this.isLoading = false;
        }
      }, speed);
    },
    // 处理请求错误
    handleRequestError(message) {
      this.isLoading = false;
      const botMsg = this.messages.find(m => m.id === this.currentBotMsgId);
      if (botMsg) {
        botMsg.isThinking = false;
        botMsg.content = message || "服务繁忙，请稍后再试。";
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