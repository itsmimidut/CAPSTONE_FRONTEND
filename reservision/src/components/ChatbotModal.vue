<template>
  <!-- Toggle Button -->
  <div 
    @click="isOpen = true"
    class="chatbot-toggle"
  >
    <div class="pulse-ring"></div>
    <i class="fas fa-robot text-2xl"></i>
    <div v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</div>
  </div>

  <!-- Modal -->
  <Transition name="modal">
    <div 
      v-if="isOpen"
      class="chatbot-modal"
    >
      <!-- Header -->
      <div class="chatbot-header">
        <div class="flex items-center gap-3">
          <div class="bot-avatar">
            <i class="fas fa-robot"></i>
            <span class="status-dot"></span>
          </div>
          <div>
            <div class="font-semibold text-base">Eduardo's Assistant</div>
            <div class="text-xs text-white/80 flex items-center gap-1">
              <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online
            </div>
          </div>
        </div>
        <button @click="closeChat" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button @click="sendQuickMessage('What rooms are available?')" class="quick-btn">
          🏨 Rooms
        </button>
        <button @click="sendQuickMessage('May promo ba?')" class="quick-btn">
          🎉 Promos
        </button>
        <button @click="sendQuickMessage('Magkano ang entrance?')" class="quick-btn">
          💰 Rates
        </button>
        <button @click="sendQuickMessage('Menu items?')" class="quick-btn">
          🍽️ Menu
        </button>
      </div>

      <!-- Messages -->
      <div ref="messagesContainer" class="messages-container">
        <div 
          v-for="(msg, index) in messages" 
          :key="index"
          class="message-wrapper"
          :class="msg.sender === 'bot' ? 'bot-message' : 'user-message'"
        >
          <div v-if="msg.sender === 'bot'" class="bot-avatar-small">
            <i class="fas fa-robot text-xs"></i>
          </div>
          
          <div class="message-bubble" :class="msg.sender">
            <div class="message-text" v-html="formatMessage(msg.text)"></div>
            <div class="message-time">{{ msg.time }}</div>
          </div>

          <div v-if="msg.sender === 'user'" class="user-avatar-small">
            <i class="fas fa-user text-xs"></i>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="message-wrapper bot-message typing-indicator">
          <div class="bot-avatar-small">
            <i class="fas fa-robot text-xs"></i>
          </div>
          <div class="typing-bubble">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="input-container">
        <div class="input-wrapper">
          <input 
            v-model="userInput"
            @keypress.enter="sendMessage"
            type="text" 
            placeholder="Magtanong tungkol sa resort..."
            class="message-input"
            :disabled="isTyping"
          />
          <button 
            @click="sendMessage"
            class="send-btn"
            :disabled="!userInput.trim() || isTyping"
          >
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        <div class="powered-by">
          Powered by <span class="font-semibold">Llama AI 🦙</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const isOpen = ref(false)
const userInput = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)
const unreadCount = ref(0)

const messages = ref([
  { 
    text: 'Kumusta! I\'m Eduardo\'s Resort AI assistant. Ask me anything about our rooms, cottages, menu, promos, and rates! 😊', 
    sender: 'bot',
    time: getCurrentTime()
  }
])

function getCurrentTime() {
  const now = new Date()
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatMessage = (text) => {
  // Convert markdown-style formatting to HTML
  return text
    // Line breaks
    .replace(/\n/g, '<br>')
    
    // Prices - green and bold
    .replace(/₱(\d+\.?\d*)/g, '<span class="price">₱$1</span>')
    
    // Percentages - red and bold
    .replace(/(\d+%)/g, '<span class="discount">$1</span>')
    
    // Bold text with **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    
    // Promo codes - highlighted
    .replace(/\b([A-Z0-9]{5,})\b/g, '<span class="promo-code">$1</span>')
    
    // Bullet points
    .replace(/^• (.+)$/gm, '<div class="bullet-point">• $1</div>')
    
    // Room numbers
    .replace(/Room (\d+)/g, '<span class="room-number">Room $1</span>')
}

const closeChat = () => {
  isOpen.value = false
  unreadCount.value = 0
}

const sendQuickMessage = (message) => {
  userInput.value = message
  sendMessage()
}

const sendMessage = async () => {
  const txt = userInput.value.trim()
  if (!txt || isTyping.value) return

  messages.value.push({ 
    text: txt, 
    sender: 'user',
    time: getCurrentTime()
  })
  userInput.value = ''
  scrollToBottom()

  isTyping.value = true

  try {
    // Using Groq with Llama 3.3 AI
    const response = await axios.post(`${API_BASE_URL}/api/resort/chat/groq`, { message: txt })
    isTyping.value = false
    
    messages.value.push({ 
      text: response.data.response, 
      sender: 'bot',
      time: getCurrentTime()
    })
    
    // Update unread count if chat is closed
    if (!isOpen.value) {
      unreadCount.value++
    }
    
    scrollToBottom()
  } catch (error) {
    isTyping.value = false
    console.error('Chatbot error:', error);
    messages.value.push({ 
      text: '❌ Sorry, may problema sa connection. Make sure ang backend server ay running sa port 8000!', 
      sender: 'bot',
      time: getCurrentTime()
    })
    scrollToBottom()
  }
}

// Reset unread when opened
watch(isOpen, (newVal) => {
  if (newVal) {
    unreadCount.value = 0
  }
})
</script>

<style scoped>

  /* Toggle Button */
  .chatbot-toggle {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 50;
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .chatbot-toggle:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
  }

  .pulse-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 3px solid #667eea;
    border-radius: 50%;
    animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  }

  @keyframes pulse-ring {
    0% {
      transform: scale(0.95);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.7;
    }
    100% {
      transform: scale(1.3);
      opacity: 0;
    }
  }

  .unread-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ef4444;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    border: 2px solid white;
    animation: bounce 1s ease infinite;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  /* Modal */
  .chatbot-modal {
    position: fixed;
    bottom: 100px;
    right: 24px;
    width: 400px;
    height: 600px;
    background: white;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    z-index: 49;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  /* Modal Transitions */
  .modal-enter-active,
  .modal-leave-active {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .modal-enter-from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }

  .modal-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }

  /* Header */
  .chatbot-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }

  .bot-avatar {
    position: relative;
    width: 44px;
    height: 44px;
    background: white;
    color: #667eea;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .status-dot {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    background: #10b981;
    border: 2px solid white;
    border-radius: 50%;
    animation: pulse 2s ease infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .close-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
    color: white;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }

  /* Quick Actions */
  .quick-actions {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    overflow-x: auto;
  }

  .quick-btn {
    padding: 8px 14px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    font-size: 12px;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
    color: #374151;
  }

  .quick-btn:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }

  /* Messages Container */
  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
    scroll-behavior: smooth;
  }

  .messages-container::-webkit-scrollbar {
    width: 6px;
  }

  .messages-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .messages-container::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }

  .messages-container::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }

  /* Message Wrapper */
  .message-wrapper {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    animation: slide-in 0.3s ease;
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message-wrapper.bot-message {
    justify-content: flex-start;
  }

  .message-wrapper.user-message {
    justify-content: flex-end;
  }

  /* Avatars */
  .bot-avatar-small,
  .user-avatar-small {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .bot-avatar-small {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .user-avatar-small {
    background: #e5e7eb;
    color: #6b7280;
  }

  /* Message Bubbles */
  .message-bubble {
    max-width: 75%;
    padding: 12px 16px;
    border-radius: 18px;
    position: relative;
  }

  .message-bubble.bot {
    background: white;
    color: #1f2937;
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e5e7eb;
  }

  .message-bubble.user {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom-right-radius: 4px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }

  .message-text {
    font-size: 14px;
    line-height: 1.6;
    word-wrap: break-word;
    margin-bottom: 4px;
  }

  /* Message Text Formatting */
  .message-text :deep(.price) {
    color: #10b981;
    font-weight: 700;
    font-size: 15px;
  }

  .message-text :deep(.discount) {
    color: #ef4444;
    font-weight: 700;
    background: #fee2e2;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .message-text :deep(.promo-code) {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: white;
    padding: 2px 8px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.5px;
  }

  .message-text :deep(.room-number) {
    color: #667eea;
    font-weight: 600;
    background: #eef2ff;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .message-text :deep(.bullet-point) {
    margin-left: 8px;
    margin-top: 4px;
    margin-bottom: 4px;
  }

  .message-text :deep(strong) {
    font-weight: 700;
    color: inherit;
  }

  .user-message .message-text :deep(.price),
  .user-message .message-text :deep(.discount),
  .user-message .message-text :deep(.promo-code),
  .user-message .message-text :deep(.room-number) {
    background: rgba(255, 255, 255, 0.3);
    color: white;
  }

  .message-time {
    font-size: 10px;
    opacity: 0.6;
    text-align: right;
    margin-top: 4px;
  }

  /* Typing Indicator */
  .typing-indicator {
    animation: fade-in 0.3s ease;
  }

  .typing-bubble {
    background: white;
    padding: 12px 16px;
    border-radius: 18px;
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e5e7eb;
  }

  .typing-dots {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .typing-dots span {
    width: 8px;
    height: 8px;
    background: #667eea;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;
  }

  .typing-dots span:nth-child(1) {
    animation-delay: 0s;
  }

  .typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-8px);
      opacity: 1;
    }
  }

  /* Input Container */
  .input-container {
    padding: 16px;
    background: white;
    border-top: 1px solid #e5e7eb;
  }

  .input-wrapper {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  .message-input {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 24px;
    font-size: 14px;
    outline: none;
    transition: all 0.2s;
    background: #f9fafb;
  }

  .message-input:focus {
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }

  .message-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .send-btn {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    flex-shrink: 0;
  }

  .send-btn:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .send-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .powered-by {
    text-align: center;
    font-size: 11px;
    color: #9ca3af;
    margin-top: 8px;
  }

  /* Mobile Responsive */
  @media (max-width: 480px) {
    .chatbot-modal {
      width: calc(100vw - 32px);
      height: calc(100vh - 140px);
      right: 16px;
      bottom: 90px;
    }

    .chatbot-toggle {
      bottom: 16px;
      right: 16px;
      width: 56px;
      height: 56px;
    }

    .quick-actions {
      padding: 10px 12px;
    }

    .quick-btn {
      padding: 6px 12px;
      font-size: 11px;
    }

    .message-bubble {
      max-width: 85%;
    }
  }
</style>