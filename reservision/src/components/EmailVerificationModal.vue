<template>
  <transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <!-- Close Button -->
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>

        <!-- Header -->
        <div class="modal-header">
          <div class="icon-circle">
            <i :class="verified ? 'fas fa-check-circle' : 'fas fa-envelope'" 
               :style="{ color: verified ? '#48BB78' : '#2B6CB0' }"></i>
          </div>
          <h2 class="modal-title">
            {{ verified ? 'Email Verified!' : 'Verify Your Email' }}
          </h2>
          <p class="modal-subtitle">
            {{ verified 
              ? 'You can now proceed with your payment' 
              : 'We\'ll send a verification code to confirm your booking' 
            }}
          </p>
        </div>

        <!-- Not Verified - Send OTP -->
        <div v-if="!verified && !otpSent" class="modal-body">
          <div class="input-group">
            <label class="input-label">Email Address</label>
            <input 
              type="email" 
              class="input-field" 
              v-model="email" 
              placeholder="your-email@example.com"
              :disabled="loading"
              @keypress.enter="sendCode">
          </div>
          
          <button 
            class="btn-primary" 
            :class="{ 'btn-loading': loading }" 
            @click="sendCode"
            :disabled="!email || loading">
            <span class="btn-text">
              <i class="fas fa-paper-plane"></i> Send Verification Code
            </span>
          </button>
        </div>

        <!-- OTP Sent - Verify Code -->
        <div v-else-if="!verified && otpSent" class="modal-body">
          <div class="info-box">
            <i class="fas fa-info-circle"></i>
            <p>Code sent to <strong>{{ email }}</strong></p>
          </div>

          <div class="input-group">
            <label class="input-label">Enter 6-Digit Code</label>
            <input 
              type="text" 
              class="input-field otp-input" 
              v-model="otpCode" 
              placeholder="000000"
              maxlength="6"
              :disabled="loading"
              @input="formatOTP"
              @keypress.enter="verifyCode">
          </div>

          <div class="timer-row">
            <span v-if="countdown > 0" class="timer-text">
              <i class="fas fa-clock"></i> Expires in {{ formatCountdown(countdown) }}
            </span>
            <span v-else class="timer-expired">
              <i class="fas fa-exclamation-triangle"></i> Code expired
            </span>
            <button 
              class="resend-btn"
              @click="resendCode"
              :disabled="countdown > 0 || loading">
              <i class="fas fa-redo"></i> Resend
            </button>
          </div>

          <button 
            class="btn-primary" 
            :class="{ 'btn-loading': loading }" 
            @click="verifyCode"
            :disabled="otpCode.length !== 6 || loading">
            <span class="btn-text">
              <i class="fas fa-shield-alt"></i> Verify Code
            </span>
          </button>

          <button class="btn-secondary" @click="goBack" :disabled="loading">
            <i class="fas fa-arrow-left"></i> Change Email
          </button>
        </div>

        <!-- Verified - Success -->
        <div v-else class="modal-body verified-state">
          <div class="success-box">
            <div class="success-icon">
              <i class="fas fa-check"></i>
            </div>
            <p class="success-title">Email Verified Successfully!</p>
            <p class="success-email">{{ email }}</p>
          </div>

          <button class="btn-success" @click="proceedToPayment">
            <i class="fas fa-lock"></i> Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'EmailVerificationModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    initialEmail: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      email: '',
      otpSent: false,
      otpCode: '',
      verified: false,
      loading: false,
      countdown: 0,
      countdownTimer: null,
      emailChecked: false
    };
  },
  watch: {
    show(newVal) {
      if (newVal) {
        // Reset state when modal opens
        this.resetModal();
        // Check and set email from parent
        this.checkAndSetEmail();
      }
    }
  },
  methods: {
    async checkAndSetEmail() {
      if (!this.initialEmail || this.emailChecked) return;
      
      try {
        // Check if email exists in database
        const response = await fetch(`http://localhost:8000/api/customers/check-email/${encodeURIComponent(this.initialEmail)}`);
        const data = await response.json();
        
        if (data.success && !data.exists) {
          // Email is NEW - prefill it
          this.email = this.initialEmail;
        }
        // If email exists, leave the field empty for user to confirm
        
        this.emailChecked = true;
      } catch (error) {
        console.error('Error checking email:', error);
        // On error, prefill anyway
        this.email = this.initialEmail;
      }
    },

    resetModal() {
      this.email = '';
      this.otpSent = false;
      this.otpCode = '';
      this.verified = false;
      this.loading = false;
      this.countdown = 0;
      this.emailChecked = false;
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
    },

    formatOTP() {
      this.otpCode = this.otpCode.replace(/\D/g, '').substring(0, 6);
    },

    formatCountdown(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    startCountdown() {
      this.countdown = 600; // 10 minutes
      if (this.countdownTimer) clearInterval(this.countdownTimer);
      
      this.countdownTimer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
        }
      }, 1000);
    },

    async sendCode() {
      if (!this.email || !this.email.trim()) {
        alert('Please enter your email address');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        alert('Please enter a valid email address');
        return;
      }
      
      this.loading = true;
      
      try {
        // Check if email exists in database
        const checkResponse = await fetch(`http://localhost:8000/api/customers/check-email/${encodeURIComponent(this.email)}`);
        const checkData = await checkResponse.json();
        
        if (checkData.success && checkData.exists) {
          // Email exists - show confirmation dialog
          const customerName = checkData.customer.firstName + ' ' + checkData.customer.lastName;
          const confirmed = confirm(
            `This email is registered to ${customerName}.\n\n` +
            `Is this you? Click OK to verify your email and continue.\n` +
            `Click Cancel if this is not your email.`
          );
          
          if (!confirmed) {
            this.loading = false;
            return;
          }
        }
        
        // Proceed to send OTP
        const response = await fetch('http://localhost:8000/api/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email,
            firstName: checkData.customer?.firstName || 'Guest'
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          this.otpSent = true;
          this.startCountdown();
          this.$emit('email-sent', this.email);
        } else {
          alert('❌ ' + (data.error || 'Failed to send verification code'));
        }
      } catch (error) {
        console.error('Send OTP error:', error);
        alert('❌ Failed to send verification code. Please check your connection.');
      } finally {
        this.loading = false;
      }
    },

    async verifyCode() {
      if (this.otpCode.length !== 6) {
        alert('Please enter the 6-digit verification code');
        return;
      }
      
      this.loading = true;
      
      try {
        const response = await fetch('http://localhost:8000/api/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email,
            otp: this.otpCode
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          this.verified = true;
          if (this.countdownTimer) clearInterval(this.countdownTimer);
          this.$emit('verified', this.email);
        } else {
          if (data.expired) {
            alert('❌ Verification code has expired. Please request a new code.');
          } else {
            alert('❌ ' + (data.error || 'Invalid verification code'));
          }
        }
      } catch (error) {
        console.error('Verify OTP error:', error);
        alert('❌ Failed to verify code. Please try again.');
      } finally {
        this.loading = false;
      }
    },

    async resendCode() {
      this.otpCode = '';
      this.otpSent = false;
      await this.sendCode();
    },

    goBack() {
      this.otpSent = false;
      this.otpCode = '';
      if (this.countdownTimer) clearInterval(this.countdownTimer);
    },

    proceedToPayment() {
      this.$emit('proceed-payment', this.email);
    },

    closeModal() {
      if (!this.loading) {
        this.$emit('close');
      }
    }
  },
  beforeUnmount() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }
};
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-enter-from .modal-container {
  transform: scale(0.9) translateY(20px);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.85) 100%);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; backdrop-filter: blur(0); }
  to { opacity: 1; backdrop-filter: blur(8px); }
}

.modal-container {
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 100%);
  border-radius: 24px;
  width: 100%;
  max-width: 480px;
  padding: 2.5rem;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.3),
    0 10px 30px rgba(43, 108, 176, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: #718096;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #2D3748;
  transform: rotate(90deg);
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(43, 108, 176, 0.1) 0%, rgba(99, 179, 237, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.icon-circle i {
  font-size: 2.5rem;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2D3748;
  margin-bottom: 0.5rem;
}

.modal-subtitle {
  font-size: 0.95rem;
  color: #718096;
  line-height: 1.5;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4A5568;
  margin-bottom: 0.5rem;
}

.input-field {
  padding: 0.875rem 1rem;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(240, 245, 250, 0.92) 100%);
}

.input-field:focus {
  outline: none;
  border-color: #2B6CB0;
  background: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.1), 0 4px 12px rgba(43, 108, 176, 0.15);
}

.otp-input {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.5rem;
  font-family: 'Courier New', monospace;
}

.info-box {
  background: linear-gradient(135deg, #EBF8FF 0%, #BEE3F8 100%);
  border: 1px solid #90CDF4;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #2C5282;
}

.info-box i {
  font-size: 1.25rem;
  color: #2B6CB0;
}

.timer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.timer-text {
  color: #4A5568;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.timer-expired {
  color: #E53E3E;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.resend-btn {
  background: none;
  border: none;
  color: #2B6CB0;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  transition: all 0.2s ease;
}

.resend-btn:hover:not(:disabled) {
  color: #1D4A7A;
  text-decoration: underline;
}

.resend-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #2B6CB0 0%, #1D4A7A 100%);
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(43, 108, 176, 0.28);
  position: relative;
  overflow: hidden;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(43, 108, 176, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary.btn-loading {
  pointer-events: none;
}

.btn-primary.btn-loading .btn-text {
  opacity: 0;
}

.btn-primary.btn-loading::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: white;
  border-right-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-secondary {
  background: transparent;
  color: #4A5568;
  padding: 0.875rem;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-secondary:hover:not(:disabled) {
  background: #F7FAFC;
  border-color: #CBD5E0;
}

.btn-success {
  background: linear-gradient(135deg, #48BB78 0%, #38A169 100%);
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(72, 187, 120, 0.28);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(72, 187, 120, 0.4);
}

.verified-state {
  text-align: center;
}

.success-box {
  background: linear-gradient(135deg, #F0FFF4 0%, #C6F6D5 100%);
  border: 2px solid #9AE6B4;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
}

.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #48BB78 0%, #38A169 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  animation: successPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes successPop {
  0% { transform: scale(0) rotate(-45deg); opacity: 0; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.success-icon i {
  font-size: 2rem;
  color: white;
}

.success-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #22543D;
  margin-bottom: 0.5rem;
}

.success-email {
  font-size: 0.95rem;
  color: #276749;
  font-weight: 600;
}

@media (max-width: 640px) {
  .modal-container {
    padding: 1.5rem;
    max-width: 95%;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .icon-circle {
    width: 64px;
    height: 64px;
  }

  .icon-circle i {
    font-size: 2rem;
  }

  .otp-input {
    font-size: 1.5rem;
    letter-spacing: 0.3rem;
  }
}
</style>
