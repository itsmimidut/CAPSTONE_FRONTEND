<template>
  <div class="contact-methods">
    <h3>Other Ways to Reach Us</h3>
    <div v-for="method in methods" :key="method.label" class="method-item">
      <div class="method-icon"><i :class="method.icon"></i></div>
      <div>
        <p class="font-medium">{{ method.label }}</p>
        <p class="text-sm text-gray-600">{{ method.value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const methods = [
  { icon: 'fas fa-phone', label: 'Phone', value: '(043) 288-7153' },
  { icon: 'fas fa-mobile-alt', label: 'Mobile', value: '0921 507 4378 / 0977 845 8144' },
  { icon: 'fas fa-envelope', label: 'Email', value: 'info@eduardoresort.com' }
];
</script>

<style scoped>
.contact-methods {
  background: #F5F5F5;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(2, 8, 20, 0.08);
  margin-top: 1.5rem;
}

.contact-methods h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2D3748;
  margin-bottom: 0.75rem;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.method-item:last-child {
  margin-bottom: 0;
}

.method-icon {
  width: 36px;
  height: 36px;
  background: rgba(43,108,176,.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2B6CB0;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.font-medium {
  font-weight: 500;
  color: #2D3748;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-600 {
  color: #718096;
}
</style>