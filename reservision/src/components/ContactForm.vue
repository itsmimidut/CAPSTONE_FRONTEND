<template>
  <div class="form-card">
    <h2>Send Us a Message</h2>
    <p>We'll respond within 24 hours.</p>
    <form @submit.prevent="handleSubmit">
      <div class="form-row">
        <div class="form-group">
          <input v-model="form.name" type="text" placeholder="Full Name" required>
        </div>
        <div class="form-group">
          <input v-model="form.email" type="email" placeholder="Email Address" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <input v-model="form.phone" type="tel" placeholder="Phone Number">
        </div>
        <div class="form-group">
          <select v-model="form.subject" required>
            <option value="">Select Subject</option>
            <option>Booking Inquiry</option>
            <option>Reservation</option>
            <option>General Question</option>
            <option>Feedback</option>
            <option>Complaint</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <textarea v-model="form.message" placeholder="Your Message..." required></textarea>
      </div>
      <button type="submit" class="btn-send" :disabled="loading">
        <span>{{ loading ? 'Sending...' : 'Send Message' }}</span>
        <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'"></i>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const form = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
});

const loading = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  
  try {
    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Thank you, ${form.value.name}! Your message has been sent successfully!`);
      form.value = { name: '', email: '', phone: '', subject: '', message: '' };
    } else {
      alert(data.error || 'Something went wrong. Please try again.');
    }
  } catch (err) {
    console.error(err);
    alert('No connection. Make sure server is running!');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.form-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(2, 8, 20, 0.12);
}

.form-card h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #2D3748;
  margin-bottom: 0.5rem;
}

.form-card p {
  color: #718096;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .form-row { grid-template-columns: 1fr 1fr; }
}

input, select, textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

input:focus, select:focus, textarea:focus {
  border-color: #63B3ED;
  box-shadow: 0 0 0 3px rgba(99,179,237,.2);
}

textarea {
  resize: vertical;
  min-height: 140px;
}

.btn-send {
  background: #C19A6B;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(2, 8, 20, 0.08);
}

.btn-send:hover {
  background: #8B5E3C;
  transform: translateY(-2px);
}

.btn-send:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>