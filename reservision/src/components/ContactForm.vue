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
  background: #ffffff;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(2, 8, 20, 0.15);
  max-width: 700px;
  margin: 0 auto;
}

.form-card h2 {
  font-size: 2.25rem;
  font-weight: 700;
  color: #2C3E90; /* royal blue heading */
  margin-bottom: 0.75rem;
}

.form-card p {
  color: #1a2a5a; /* dark navy for body */
  font-size: 1.125rem;
  margin-bottom: 2rem;
  line-height: 1.75;
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
  padding: 1rem 1.25rem;
  border: 1px solid #2C3E90; /* navy border */
  border-radius: 12px;
  font-size: 1.125rem; /* slightly larger for readability */
  color: #1a2a5a;
  outline: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

input::placeholder, textarea::placeholder {
  color: #718096; /* muted placeholder */
  opacity: 1;
}

input:focus, select:focus, textarea:focus {
  border-color: #2C3E90;
  box-shadow: 0 0 0 3px rgba(44,62,144,0.2);
}

textarea {
  resize: vertical;
  min-height: 150px;
}

.btn-send {
  background: #FFD700; /* gold button */
  color: #1a2a5a; /* dark text for contrast */
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
  font-size: 1.125rem;
  box-shadow: 0 6px 16px rgba(44, 62, 144, 0.2);
  transition: all 0.3s ease;
}

.btn-send:hover {
  background: #FFC107;
  transform: translateY(-2px);
}

.btn-send:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>