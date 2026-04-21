<template>
  <!-- Toggle Button -->
  <div 
    @click="toggleChat"
    class="chatbot-toggle"
    :class="{ 'is-open': isOpen }"
  >
    <div class="pulse-ring"></div>
    <i class="fas fa-robot text-xl md:text-2xl"></i>
    <div v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</div>
  </div>

  <!-- Modal Backdrop -->
  <Transition name="backdrop">
    <div 
      v-if="isOpen"
      @click="closeChat"
      class="chatbot-backdrop"
    ></div>
  </Transition>

  <!-- Modal -->
  <Transition name="modal">
    <div 
      v-if="isOpen"
      class="chatbot-modal"
      :class="{ 'is-fullscreen': isMobile && isFullscreen }"
      @click.stop
    >
      <!-- Header -->
      <div class="chatbot-header">
        <div class="flex items-center gap-2 md:gap-3">
          <div class="bot-avatar">
            <i class="fas fa-robot"></i>
            <span class="status-dot"></span>
          </div>
          <div>
            <div class="font-semibold text-sm md:text-base">Eduardo's Assistant</div>
            <div class="text-xs text-white/80 flex items-center gap-1">
              <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button 
            v-if="isMobile" 
            @click="toggleFullscreen" 
            class="header-btn"
            :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'"
          >
            <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
          </button>
          <button @click="closeChat" class="header-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div ref="messagesContainer" class="messages-container">
        <div 
          v-for="(msg, index) in messages" 
          :key="index"
          class="message-wrapper"
          :class="msg.sender === 'bot' ? 'bot-message' : 'user-message'"
          @mouseenter="hoveredMessage = index"
          @mouseleave="hoveredMessage = null"
        >
          <div v-if="msg.sender === 'bot'" class="bot-avatar-small">
            <i class="fas fa-robot text-xs"></i>
          </div>
          
          <div class="message-content-wrapper">
            <div class="message-bubble" :class="msg.sender">
              <div class="message-text" v-html="formatMessage(msg.text)"></div>
              <div class="message-time">{{ msg.time }}</div>
            </div>
            
            <!-- Message Actions -->
            <div v-if="hoveredMessage === index" class="message-actions" :class="msg.sender">
              <button 
                @click="copyMessage(msg.text)" 
                class="action-btn"
                title="Copy"
              >
                <i :class="copiedIndex === index ? 'fas fa-check' : 'far fa-copy'"></i>
              </button>
              <button 
                v-if="msg.sender === 'bot'"
                @click="replyToMessage(msg.text)" 
                class="action-btn"
                title="Reply"
              >
                <i class="fas fa-reply"></i>
              </button>
            </div>
          </div>

          <div v-if="msg.sender === 'user'" class="user-avatar-small">
            <i class="fas fa-user text-xs"></i>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="message-wrapper bot-message">
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

        <!-- Scroll to bottom button -->
        <button 
          v-if="showScrollButton"
          @click="scrollToBottom"
          class="scroll-bottom-btn"
        >
          <i class="fas fa-arrow-down"></i>
        </button>
      </div>

      <!-- Reply Preview -->
      <div v-if="replyPreview" class="reply-preview">
        <div class="reply-preview-content">
          <i class="fas fa-reply text-xs text-gray-400"></i>
          <span class="text-xs text-gray-600 truncate">{{ replyPreview }}</span>
        </div>
        <button @click="cancelReply" class="cancel-reply-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Input -->
      <div class="input-container">
        <!-- Paste suggestion -->
        <div v-if="showPasteSuggestion" class="paste-suggestion">
          <i class="fas fa-paste"></i>
          <span>Tap to paste from clipboard</span>
          <button @click="pasteFromClipboard" class="paste-btn">Paste</button>
        </div>

        <div class="input-wrapper">
          <button 
            @click="handlePaste"
            class="paste-icon-btn"
            title="Paste from clipboard"
          >
            <i class="fas fa-paste"></i>
          </button>
          
          <input 
            ref="messageInput"
            v-model="userInput"
            @keypress.enter="sendMessage"
            @paste="onPaste"
            @focus="onInputFocus"
            type="text" 
            :placeholder="isMobile ? 'Type message...' : 'Magtanong tungkol sa resort...'"
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
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const isOpen = ref(false)
const userInput = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)
const messageInput = ref(null)
const unreadCount = ref(0)
const isMobile = ref(false)
const isFullscreen = ref(false)
const hoveredMessage = ref(null)
const copiedIndex = ref(null)
const replyPreview = ref('')
const showPasteSuggestion = ref(false)
const showScrollButton = ref(false)

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
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

const handleScroll = () => {
  if (messagesContainer.value) {
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
    showScrollButton.value = scrollHeight - scrollTop - clientHeight > 100
  }
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
  isFullscreen.value = false
  replyPreview.value = ''
  showPasteSuggestion.value = false
}

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    unreadCount.value = 0
    nextTick(() => {
      messageInput.value?.focus()
      scrollToBottom()
    })
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

// Copy message to clipboard
const copyMessage = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    const index = messages.value.findIndex(msg => msg.text === text)
    copiedIndex.value = index
    
    // Show copy success feedback
    setTimeout(() => {
      copiedIndex.value = null
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Reply to message
const replyToMessage = (text) => {
  replyPreview.value = text.length > 50 ? text.substring(0, 50) + '...' : text
  messageInput.value?.focus()
}

const cancelReply = () => {
  replyPreview.value = ''
}

// Paste from clipboard
const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    userInput.value = text
    showPasteSuggestion.value = false
    messageInput.value?.focus()
  } catch (err) {
    console.error('Failed to paste:', err)
  }
}

const handlePaste = () => {
  pasteFromClipboard()
}

const onPaste = (event) => {
  // Handle paste event naturally
  setTimeout(() => {
    showPasteSuggestion.value = false
  }, 100)
}

const onInputFocus = async () => {
  try {
    // Check if clipboard has content
    const text = await navigator.clipboard.readText()
    if (text && text.length > 0 && !userInput.value) {
      showPasteSuggestion.value = true
      setTimeout(() => {
        showPasteSuggestion.value = false
      }, 5000)
    }
  } catch (err) {
    // Clipboard access denied or empty
  }
}

const sendMessage = async () => {
  const txt = userInput.value.trim()
  if (!txt || isTyping.value) return

  // Add reply context if exists
  const messageWithContext = replyPreview.value 
    ? `Replying to: "${replyPreview.value}"\n\n${txt}`
    : txt

  messages.value.push({ 
    text: messageWithContext, 
    sender: 'user',
    time: getCurrentTime()
  })
  
  userInput.value = ''
  replyPreview.value = ''
  showPasteSuggestion.value = false
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

// Check if mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 640
}

// Handle escape key
const handleEscape = (e) => {
  if (e.key === 'Escape') {
    if (replyPreview.value) {
      cancelReply()
    } else if (isOpen.value) {
      closeChat()
    }
  }
}

watch(isOpen, (newVal) => {
  if (newVal) {
    unreadCount.value = 0
    if (isMobile.value) {
      document.body.style.overflow = 'hidden'
    }
    nextTick(() => {
      scrollToBottom()
    })
  } else {
    document.body.style.overflow = ''
    replyPreview.value = ''
    showPasteSuggestion.value = false
  }
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('keydown', handleEscape)
  
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
  
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
/* ===== Eduardo's Resort Color Palette ===== */
:root {
  --color-primary: #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark: #1E88B6;
  --color-gold: #F4C400;
  --color-gold-dark: #F2C200;
  --color-navy: #0C3B5E;
  --color-white: #FFFFFF;
  --color-gray-bg: #f9fafb;
  --color-gray-border: #e5e7eb;
  --color-text-dark: #1f2937;
  --color-text-light: #6b7280;
}

/* ===== Toggle Button ===== */
.chatbot-toggle {
  position: fixed;
  bottom: clamp(16px, 4vw, 24px);
  right: clamp(16px, 4vw, 24px);
  z-index: 1000;
  width: clamp(56px, 15vw, 64px);
  height: clamp(56px, 15vw, 64px);
  background: linear-gradient(135deg, #0369a1 0%, #1E88B6 100%);
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(3, 105, 161, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.chatbot-toggle:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(244, 196, 0, 0.3);
}

.chatbot-toggle.is-open {
  transform: scale(0.9);
  opacity: 0.8;
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
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 12px;
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

/* ===== Modal ===== */
.chatbot-modal {
  position: fixed;
  bottom: clamp(80px, 20vw, 100px);
  right: clamp(12px, 4vw, 24px);
  width: min(400px, calc(100vw - 24px));
  height: min(600px, calc(100vh - 130px));
  max-height: 700px;
  background: #FFFFFF;
  border-radius: clamp(16px, 5vw, 24px);
  box-shadow: 0 20px 60px rgba(3, 105, 161, 0.2);
  overflow: hidden;
  z-index: 999;
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.chatbot-modal.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
  border-radius: 0;
  z-index: 1001;
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

.chatbot-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 998;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* ===== Header ===== */
.chatbot-header {
  background: linear-gradient(135deg, #0369a1 0%, #1E88B6 100%);
  color: #FFFFFF;
  padding: clamp(12px, 3vw, 16px) clamp(16px, 4vw, 20px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(3, 105, 161, 0.2);
  flex-shrink: 0;
}

.bot-avatar {
  position: relative;
  width: clamp(40px, 10vw, 44px);
  height: clamp(40px, 10vw, 44px);
  background: #FFFFFF;
  color: #0369a1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(16px, 4vw, 18px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: clamp(10px, 3vw, 12px);
  height: clamp(10px, 3vw, 12px);
  background: #10b981;
  border: 2px solid #FFFFFF;
  border-radius: 50%;
  animation: pulse-dot 2s ease infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.header-btn {
  width: clamp(32px, 8vw, 36px);
  height: clamp(32px, 8vw, 36px);
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
  font-size: clamp(14px, 4vw, 16px);
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* ===== Messages Container ===== */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: clamp(12px, 3vw, 16px);
  background: #f9fafb;
  scroll-behavior: smooth;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
  position: relative;
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

/* Scroll to bottom button */
.scroll-bottom-btn {
  position: sticky;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  background: #0369a1;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(3, 105, 161, 0.3);
  transition: all 0.2s;
  z-index: 10;
  animation: fade-in 0.3s ease;
}

.scroll-bottom-btn:hover {
  transform: translateX(-50%) scale(1.1);
  background: #1E88B6;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateX(-50%) scale(0.8); }
  to { opacity: 1; transform: translateX(-50%) scale(1); }
}

/* Message Wrapper */
.message-wrapper {
  display: flex;
  gap: clamp(6px, 2vw, 8px);
  margin-bottom: clamp(12px, 3vw, 14px);
  animation: slide-in 0.3s ease;
  position: relative;
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

.message-content-wrapper {
  position: relative;
  max-width: min(75%, 300px);
}

/* Avatars */
.bot-avatar-small,
.user-avatar-small {
  width: clamp(26px, 7vw, 30px);
  height: clamp(26px, 7vw, 30px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: clamp(10px, 3vw, 12px);
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
  padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 14px);
  border-radius: 18px;
  position: relative;
  word-break: break-word;
  overflow-wrap: break-word;
  transition: all 0.2s;
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
  font-size: clamp(12px, 3.5vw, 13.5px);
  line-height: 1.6;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  margin-bottom: 4px;
}

.message-time {
  font-size: clamp(9px, 2.5vw, 10px);
  opacity: 0.6;
  text-align: right;
  margin-top: 2px;
  white-space: nowrap;
}

/* Message Actions */
.message-actions {
  position: absolute;
  top: -30px;
  right: 0;
  display: flex;
  gap: 4px;
  background: white;
  padding: 4px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: slide-down 0.2s ease;
  z-index: 5;
}

.message-actions.bot {
  right: auto;
  left: 0;
}

@keyframes slide-down {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #0369a1;
}

/* Formatted spans */
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
  font-size: clamp(11px, 3vw, 12px);
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
  padding: clamp(10px, 2.5vw, 12px) clamp(14px, 3.5vw, 16px);
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
  width: clamp(7px, 2vw, 8px);
  height: clamp(7px, 2vw, 8px);
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

/* Reply Preview */
.reply-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.reply-preview-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.cancel-reply-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.cancel-reply-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}

/* ===== Input Container ===== */
.input-container {
  padding: clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px);
  background: #FFFFFF;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

/* Paste Suggestion */
.paste-suggestion {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  color: #1e40af;
  font-size: 12px;
  animation: slide-down 0.3s ease;
}

.paste-suggestion i {
  color: #3b82f6;
}

.paste-suggestion span {
  flex: 1;
}

.paste-btn {
  padding: 4px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.paste-btn:hover {
  background: #2563eb;
}

.input-wrapper {
  display: flex;
  gap: clamp(6px, 2vw, 8px);
  align-items: center;
}

.paste-icon-btn {
  width: clamp(38px, 10vw, 42px);
  height: clamp(38px, 10vw, 42px);
  min-width: clamp(38px, 10vw, 42px);
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  flex-shrink: 0;
}

.paste-icon-btn:hover {
  background: #e5e7eb;
  color: #0369a1;
}

.message-input {
  flex: 1;
  padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px);
  border: 2px solid #e5e7eb;
  border-radius: 24px;
  font-size: clamp(13px, 3.5vw, 13.5px);
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

.message-input::placeholder {
  color: #9ca3af;
}

.send-btn {
  width: clamp(38px, 10vw, 42px);
  height: clamp(38px, 10vw, 42px);
  min-width: clamp(38px, 10vw, 42px);
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
  font-size: clamp(14px, 4vw, 16px);
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(244, 196, 0, 0.4);
}

.send-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===== Responsive Breakpoints ===== */
@media (min-width: 768px) {
  .chatbot-modal {
    width: 420px;
    height: 650px;
  }
}

@media (min-width: 1024px) {
  .chatbot-modal {
    width: 450px;
    height: 700px;
  }

  .chatbot-toggle {
    width: 68px;
    height: 68px;
  }

  .message-text {
    font-size: 14px;
  }
}

@media (min-width: 1440px) {
  .chatbot-modal {
    width: 480px;
    height: 750px;
  }

  .chatbot-toggle {
    width: 72px;
    height: 72px;
  }
}

/* Mobile Landscape */
@media (max-width: 640px) and (orientation: landscape) {
  .chatbot-modal {
    height: 100vh;
    max-height: 100vh;
    bottom: 0;
    right: 0;
    border-radius: 0;
  }

  .messages-container {
    max-height: calc(100vh - 200px);
  }
}

/* Small Mobile */
@media (max-width: 360px) {
  .chatbot-modal {
    width: 100vw;
    right: 0;
    bottom: 0;
    border-radius: 16px 16px 0 0;
  }

  .paste-icon-btn {
    display: none;
  }
}

/* Touch Device Optimizations */
@media (hover: none) and (pointer: coarse) {
  .action-btn:hover {
    background: transparent;
  }

  .action-btn:active {
    background: #f3f4f6;
  }

  .send-btn:hover:not(:disabled) {
    transform: none;
  }

  .send-btn:active:not(:disabled) {
    transform: scale(0.95);
  }
}

/* High Contrast / Accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>