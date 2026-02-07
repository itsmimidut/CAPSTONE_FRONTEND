<template>
  <div
    v-show="isOpen"
    class="overlay"
    :class="{ active: isOpen }"
    @click="emit('close')"
  ></div>

  <aside class="sidebar" :class="{ active: isOpen, collapsed: isCollapsed }">
    <div class="sidebar-header">
      <div class="logo-container">
        <span class="logo-text w-full">
          <img
            src="/Eduardos Resort Logo.jpg"
            alt="Reservision"
            class="logo-image"
          />
        </span>
      </div>
      <button class="md:hidden" @click="emit('close')">
        <i class="fas fa-bars"></i>
      </button>
    </div>

    <div class="user-info">
      <div class="user-avatar">
        <span>{{ userInitial }}</span>
      </div>
      <div>
        <div class="font-medium">{{ userName }}</div>
        <div class="text-xs opacity-70">{{ userRole }}</div>
      </div>
    </div>

    <div class="nav-container">
      <ul class="nav-list">
        <li v-for="item in items" :key="item.id" class="nav-item">
          <a
            href="#"
            class="nav-link"
            :class="{ active: activeSection === item.id }"
            @click.prevent="handleSelect(item.id)"
          >
            <i :class="['nav-icon', 'fas', item.icon]"></i>
            <span class="nav-text">{{ item.label }}</span>
          </a>
        </li>
      </ul>
    </div>

    <div class="logout-container">
      <router-link
        to="/login"
        class="nav-link"
        @click="$emit('close')"
      >
        <i class="fas fa-sign-out-alt nav-icon"></i>
        <span class="nav-text">Logout</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  activeSection: {
    type: String,
    default: 'dashboard',
  },
  brand: {
    type: String,
    default: 'Reservision',
  },
  userName: {
    type: String,
    default: 'Customer',
  },
  userRole: {
    type: String,
    default: 'Customer',
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['select', 'close']);

const userInitial = computed(() => props.userName.charAt(0).toUpperCase());

const handleSelect = (sectionId) => {
  emit('select', sectionId);
  emit('close');
};
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  z-index: 39;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.overlay.active {
  opacity: 1;
  visibility: visible;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background-color: #2B6CB0;
  color: white;
  z-index: 50;
  overflow: hidden;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  transform: translateX(-100%);
  display: flex;
  flex-direction: column;
}

.sidebar.active {
  transform: translateX(0);
}

@media (min-width: 768px) {
  .sidebar {
    transform: translateX(0) !important;
  }

  .sidebar.collapsed {
    width: 70px;
  }
}

.sidebar-header {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.logo-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  font-weight: 600;
  width: 100%;
}

.logo-image {
  width: 100%;
  height: auto;
  display: block;
}

.user-info {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 3rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.nav-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
}

.nav-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 0.9375rem;
  border-radius: 0.5rem;
  transition: all 0.3s;
  white-space: nowrap;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
  border-left: 3px solid white;
}

.nav-icon {
  width: 1.25rem;
  text-align: center;
}

.nav-text {
  margin-left: 0.75rem;
  opacity: 1;
  transition: opacity 0.2s ease 0.1s;
}

.sidebar.collapsed .nav-text,
.sidebar.collapsed .logo-text,
.sidebar.collapsed .user-info > div {
  opacity: 0;
  visibility: hidden;
  width: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.sidebar.collapsed .logo-text {
  display: none;
}

.logout-container {
  padding: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
