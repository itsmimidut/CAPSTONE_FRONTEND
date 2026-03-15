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
    text: 'Kumusta! I\'m Eduardo\'s Resort AI assistant. Ask me anything about our rooms, cottages, and menu! 😊', 
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
  return text
    .replace(/\n/g, '<br>')
    .replace(/₱(\d+\.?\d*)/g, '<span class="price">₱$1</span>')
    .replace(/(\d+%)/g, '<span class="discount">$1</span>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\b([A-Z0-9]{5,})\b/g, '<span class="promo-code">$1</span>')
    .replace(/^• (.+)$/gm, '<div class="bullet-point">• $1</div>')
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
    const response = await axios.post(`${API_BASE_URL}/api/resort/chat/groq`, { message: txt })
    isTyping.value = false
    
    messages.value.push({ 
      text: response.data.response, 
      sender: 'bot',
      time: getCurrentTime()
    })
    
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

watch(isOpen, (newVal) => {
  if (newVal) {
    unreadCount.value = 0
  }
})
</script>

<style scoped>
/* ===== Eduardo's Resort Color Palette ===== */
.chatbot-toggle,
.chatbot-modal,
.chatbot-header,
.quick-actions,
.messages-container,
.message-bubble,
.input-container,
.message-input,
.send-btn {
  --color-primary: #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark: #1E88B6;
  --color-gold: #F4C400;
  --color-gold-dark: #F2C200;
  --color-navy: #0C3B5E;
  --color-white: #FFFFFF;
  --color-white-soft: rgba(255, 255, 255, 0.1);
  --color-gray-bg: #f9fafb;
  --color-gray-border: #e5e7eb;
  --color-text-dark: #1f2937;
  --color-text-light: #6b7280;
}

/* Toggle Button */
.chatbot-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #0369a1 0%, #1E88B6 100%);
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(3, 105, 161, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.chatbot-toggle:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(244, 196, 0, 0.3);
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid #F4C400;
  border-radius: 50%;
  animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1.3); opacity: 0; }
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #F4C400;
  color: #0C3B5E;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  border: 2px solid #FFFFFF;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* Modal — fixed position with top offset so header is never clipped */
.chatbot-modal {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 400px;
  height: min(600px, calc(100vh - 130px));
  background: #FFFFFF;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(3, 105, 161, 0.2);
  overflow: hidden;
  z-index: 999;
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
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
  background: linear-gradient(135deg, #0369a1 0%, #1E88B6 100%);
  color: #FFFFFF;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(3, 105, 161, 0.2);
  flex-shrink: 0;
}

.bot-avatar {
  position: relative;
  width: 44px;
  height: 44px;
  background: #FFFFFF;
  color: #0369a1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border: 2px solid #FFFFFF;
  border-radius: 50%;
  animation: pulse-dot 2s ease infinite;
}

@keyframes pulse-dot {
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
  color: #FFFFFF;
  background: transparent;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(90deg);
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
  flex-shrink: 0;
  scrollbar-width: none;
}

.quick-actions::-webkit-scrollbar {
  display: none;
}

.quick-btn {
  padding: 7px 13px;
  background: #FFFFFF;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  color: #1f2937;
}

.quick-btn:hover {
  background: #F4C400;
  color: #0C3B5E;
  border-color: #F4C400;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(244, 196, 0, 0.3);
}

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f9fafb;
  scroll-behavior: smooth;
  min-height: 0;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #1F8DBF;
}

/* Message Wrapper */
.message-wrapper {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  animation: slide-in 0.3s ease;
}

@keyframes slide-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-wrapper.bot-message {
  justify-content: flex-start;
  align-items: flex-end;
}

.message-wrapper.user-message {
  justify-content: flex-end;
  align-items: flex-end;
}

/* Avatars */
.bot-avatar-small,
.user-avatar-small {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bot-avatar-small {
  background: linear-gradient(135deg, #0369a1 0%, #1E88B6 100%);
  color: #FFFFFF;
}

.user-avatar-small {
  background: #F2C200;
  color: #0C3B5E;
}

/* Message Bubbles */
.message-bubble {
  max-width: 72%;
  min-width: 0;
  padding: 10px 14px;
  border-radius: 18px;
  position: relative;
  word-break: break-word;
  overflow-wrap: break-word;
}

.message-bubble.bot {
  background: #FFFFFF;
  color: #1f2937;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.message-bubble.user {
  background: linear-gradient(135deg, #0369a1 0%, #1E88B6 100%);
  color: #FFFFFF;
  border-bottom-right-radius: 4px;
  box-shadow: 0 2px 8px rgba(3, 105, 161, 0.3);
}

.message-text {
  font-size: 13.5px;
  line-height: 1.6;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  margin-bottom: 4px;
}

.message-time {
  font-size: 10px;
  opacity: 0.6;
  text-align: right;
  margin-top: 2px;
  white-space: nowrap;
}

/* Inline formatted spans */
:deep(.price) {
  font-weight: 700;
  color: #0369a1;
}

.message-bubble.user :deep(.price) {
  color: #F4C400;
}

:deep(.discount) {
  font-weight: 700;
  color: #10b981;
}

:deep(.promo-code) {
  font-family: monospace;
  background: rgba(3, 105, 161, 0.1);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12px;
}

:deep(.bullet-point) {
  padding-left: 4px;
  margin: 2px 0;
}

:deep(.room-number) {
  font-weight: 600;
  color: #0369a1;
}

/* Typing Indicator */
.typing-bubble {
  background: #FFFFFF;
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
  background: #0369a1;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: 0s; }
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-8px); opacity: 1; }
}

/* Input Container */
.input-container {
  padding: 12px 16px;
  background: #FFFFFF;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.input-wrapper {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  align-items: center;
}

.message-input {
  flex: 1;
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 24px;
  font-size: 13.5px;
  outline: none;
  transition: all 0.2s;
  background: #f9fafb;
  color: #1f2937;
  min-width: 0;
}

.message-input:focus {
  border-color: #F4C400;
  background: #FFFFFF;
  box-shadow: 0 0 0 4px rgba(244, 196, 0, 0.1);
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  width: 42px;
  height: 42px;
  min-width: 42px;
  background: linear-gradient(135deg, #F4C400 0%, #F2C200 100%);
  color: #0C3B5E;
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
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(244, 196, 0, 0.4);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.powered-by {
  text-align: center;
  font-size: 11px;
  color: #1F8DBF;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .chatbot-modal {
    width: calc(100vw - 24px);
    height: min(580px, calc(100vh - 110px));
    right: 12px;
    bottom: 88px;
  }

  .chatbot-toggle {
    bottom: 16px;
    right: 16px;
    width: 56px;
    height: 56px;
  }
}
</style>