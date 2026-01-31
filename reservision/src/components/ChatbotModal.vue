<template>
  <!-- Toggle Button -->
  <div 
    @click="isOpen = true"
    class="fixed bottom-6 right-6 z-50 w-[60px] h-[60px] bg-gradient-to-br from-primary-blue to-accent-blue text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(30,64,175,0.3)] cursor-pointer transition-transform hover:scale-110 animate-pulse"
  >
    <i class="fas fa-robot text-2xl"></i>
  </div>

  <!-- Modal -->
  <div 
    v-show="isOpen"
    class="fixed bottom-[100px] right-6 w-[360px] h-[520px] bg-white rounded-[20px] shadow-[0_15px_35px_rgba(0,0,0,0.15)] overflow-hidden z-[49] flex flex-col transition-all duration-400"
    :class="isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95'"
  >
    <!-- Header -->
    <div class="bg-gradient-to-r from-primary-blue to-accent-blue text-white px-5 py-4 font-semibold flex justify-between items-center">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <i class="fas fa-robot text-sm"></i>
        </div>
        <span>Eduardo's Assistant</span>
      </div>
      <button @click="isOpen = false" class="text-white hover:text-gray-200">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 p-4 overflow-y-auto bg-gray-50">
      <div 
        v-for="(msg, index) in messages" 
        :key="index"
        class="mb-3 flex animate-fade-in"
        :class="msg.sender === 'bot' ? 'justify-start' : 'justify-end'"
      >
        <div 
          class="max-w-[75%] px-3.5 py-2.5 rounded-[18px] text-sm leading-relaxed"
          :class="msg.sender === 'bot' 
            ? 'bg-white rounded-bl-sm shadow-sm' 
            : 'bg-accent-blue text-white rounded-br-sm'"
        >
          {{ msg.text }}
        </div>
      </div>

      <!-- Typing Indicator -->
      <div v-if="isTyping" class="mb-3 flex justify-start animate-fade-in">
        <div class="bg-white px-3.5 py-2.5 rounded-[18px] rounded-bl-sm shadow-sm text-sm">
          typing...
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="p-4 bg-white border-t border-gray-200 flex gap-2.5">
      <input 
        v-model="userInput"
        @keypress.enter="sendMessage"
        type="text" 
        placeholder="Type your message..."
        class="flex-1 px-4 py-3 border border-gray-300 rounded-full outline-none text-sm focus:border-accent-blue focus:ring-4 focus:ring-blue-100"
      />
      <button 
        @click="sendMessage"
        class="w-10 h-10 bg-accent-blue text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
      >
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import axios from 'axios'

const isOpen = ref(false)
const userInput = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)
const messages = ref([
  { text: 'Hello! How can I help you today?', sender: 'bot' }
])

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  const txt = userInput.value.trim()
  if (!txt) return

  messages.value.push({ text: txt, sender: 'user' })
  userInput.value = ''
  scrollToBottom()

  isTyping.value = true

  try {
    const response = await axios.post('/api/resort/chat', { message: txt })
    isTyping.value = false
    messages.value.push({ text: response.data.reply, sender: 'bot' })
    scrollToBottom()
  } catch (error) {
    isTyping.value = false
    messages.value.push({ 
      text: 'Sorry, offline ako ngayon. Try mo ulit mamaya!', 
      sender: 'bot' 
    })
    scrollToBottom()
  }
}

// Welcome message when opened
watch(isOpen, (newVal) => {
  if (newVal && messages.value.length === 1) {
    setTimeout(() => {
      messages.value.push({ 
        text: "Hi! Welcome to Eduardo's Resort! How can I help you today?", 
        sender: 'bot' 
      })
      scrollToBottom()
    }, 500)
  }
})
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease;
}

@media (max-width: 480px) {
  div[class*="w-[360px]"] {
    width: calc(100vw - 32px);
    right: 16px;
    height: 480px;
  }
}
</style>