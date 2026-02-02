<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Swimming Lesson Enrollment</h2>
        <button @click="$emit('close')" class="close-btn" type="button">✕</button>
      </div>

      <form class="modal-content" @submit.prevent="submit">
        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <section class="form-section">
          <h3 class="section-title">Personal Information</h3>
          <div class="form-grid two">
            <div class="form-field">
              <label>First Name *</label>
              <input v-model="form.firstName" type="text" required />
            </div>
            <div class="form-field">
              <label>Middle Name</label>
              <input v-model="form.middleName" type="text" />
            </div>
          </div>
          <div class="form-grid two">
            <div class="form-field">
              <label>Last Name *</label>
              <input v-model="form.lastName" type="text" required />
            </div>
            <div class="form-field">
              <label>Date of Birth *</label>
              <input v-model="form.dateOfBirth" type="date" required />
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">Personal Details</h3>
          <div class="form-grid three">
            <div class="form-field">
              <label>Sex</label>
              <select v-model="form.sex">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div class="form-field">
              <label>Weight</label>
              <input v-model="form.weight" type="text" placeholder="e.g., 25 Kilos" />
            </div>
            <div class="form-field">
              <label>Height</label>
              <input v-model="form.height" type="text" placeholder="e.g., 35 Inches" />
            </div>
          </div>
          <div class="form-grid two">
            <div class="form-field">
              <label>Preferred Coach *</label>
              <select v-model="form.preferredCoach" required>
                <option value="">Select a Coach</option>
                <option v-for="coach in coaches" :key="coach.coach_id" :value="coach.name">
                  {{ coach.name }} - {{ coach.specialization }}
                </option>
              </select>
            </div>
            <div class="form-field">
              <label>Address *</label>
              <input v-model="form.address" type="text" required />
            </div>
          </div>
          <div class="form-grid three">
            <div class="form-field">
              <label>Home Phone</label>
              <input v-model="form.homePhone" type="tel" />
            </div>
            <div class="form-field">
              <label>Mobile Phone</label>
              <input v-model="form.mobilePhone" type="tel" />
            </div>
            <div class="form-field">
              <label>Email *</label>
              <input v-model="form.email" type="email" required />
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">Parent/Guardian Information</h3>
          <div class="form-grid three">
            <div class="form-field">
              <label>Father's Name</label>
              <input v-model="form.fatherName" type="text" />
            </div>
            <div class="form-field">
              <label>Father's Occupation</label>
              <input v-model="form.fatherOccupation" type="text" />
            </div>
            <div class="form-field">
              <label>Father's Phone</label>
              <input v-model="form.fatherPhone" type="tel" />
            </div>
          </div>
          <div class="form-grid three">
            <div class="form-field">
              <label>Mother's Name</label>
              <input v-model="form.motherName" type="text" />
            </div>
            <div class="form-field">
              <label>Mother's Occupation</label>
              <input v-model="form.motherOccupation" type="text" />
            </div>
            <div class="form-field">
              <label>Mother's Phone</label>
              <input v-model="form.motherPhone" type="tel" />
            </div>
          </div>
          <div class="form-grid three">
            <div class="form-field">
              <label>Emergency Contact Name</label>
              <input v-model="form.emergencyContactName" type="text" />
            </div>
            <div class="form-field">
              <label>Emergency Contact Phone</label>
              <input v-model="form.emergencyContactPhone" type="tel" />
            </div>
            <div class="form-field">
              <label>Relationship</label>
              <input v-model="form.emergencyContactRelationship" type="text" />
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">School/Employer Information</h3>
          <div class="form-grid two">
            <div class="form-field">
              <label>School or Employer Name</label>
              <input v-model="form.schoolName" type="text" />
            </div>
            <div class="form-field">
              <label>School or Employer Address</label>
              <input v-model="form.schoolAddress" type="text" />
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">Contact Person</h3>
          <div class="form-grid two">
            <div class="form-field">
              <label>Contact Person Name</label>
              <input v-model="form.contactName" type="text" />
            </div>
            <div class="form-field">
              <label>Contact Person Number</label>
              <input v-model="form.contactNumber" type="tel" />
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">Medical Information</h3>
          <div class="form-grid two">
            <div class="form-field">
              <label>Medical Conditions</label>
              <textarea v-model="form.medicalConditions" rows="2"></textarea>
            </div>
            <div class="form-field">
              <label>Allergies</label>
              <textarea v-model="form.allergies" rows="2"></textarea>
            </div>
          </div>
          <div class="form-grid two">
            <div class="form-field">
              <label>Medications</label>
              <textarea v-model="form.medications" rows="2"></textarea>
            </div>
            <div class="form-field">
              <label>Physician Name</label>
              <input v-model="form.physicianName" type="text" />
            </div>
          </div>
          <div class="form-grid one">
            <div class="form-field">
              <label>Physician Phone</label>
              <input v-model="form.physicianPhone" type="tel" />
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">Swimming Details</h3>
          <div class="form-grid three">
            <div class="form-field">
              <label>Lesson Type *</label>
              <select v-model="form.lessonType" required>
                <option value="">Select lesson type</option>
                <option value="Group Lessons">Group Lessons</option>
                <option value="Private Lessons">Private Lessons</option>
              </select>
            </div>
            <div class="form-field">
              <label>Skill Level</label>
              <select v-model="form.skillLevel">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div class="form-field">
              <label>Start Date</label>
              <input v-model="form.startDate" type="date" />
            </div>
          </div>
          <div class="form-grid two">
            <div class="form-field">
              <label>Previous Experience</label>
              <textarea v-model="form.previousExperience" rows="2"></textarea>
            </div>
            <div class="form-field">
              <label>Swimming Goals</label>
              <textarea v-model="form.swimmingGoals" rows="2"></textarea>
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">Schedule Preferences</h3>
          <div class="form-grid two">
            <div class="form-field">
              <label>Preferred Days</label>
              <input v-model="form.preferredDays" type="text" placeholder="e.g., Mon/Wed/Fri" />
            </div>
            <div class="form-field">
              <label>Preferred Time</label>
              <input v-model="form.preferredTime" type="text" placeholder="e.g., 8:00 AM" />
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">Additional Information</h3>
          <div class="form-grid two">
            <div class="form-field">
              <label>How did you hear about us?</label>
              <input v-model="form.howDidYouHear" type="text" />
            </div>
            <div class="form-field">
              <label>Special Requests</label>
              <textarea v-model="form.specialRequests" rows="2"></textarea>
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3 class="section-title">Agreement</h3>
          <div class="form-grid two">
            <label class="checkbox-field">
              <input v-model="form.agreedToTerms" type="checkbox" />
              I agree to the terms and conditions
            </label>
            <label class="checkbox-field">
              <input v-model="form.agreedToWaiver" type="checkbox" />
              I agree to the waiver and safety policy
            </label>
          </div>
        </section>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">Cancel</button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Submitting...' : 'Submit Enrollment' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useSwimmingEnrollmentStore } from '../../stores/swimmingEnrollment'

const props = defineProps({ preselectedType: String })
const emit = defineEmits(['close', 'submit'])

const store = useSwimmingEnrollmentStore()
const isSubmitting = computed(() => store.submitting)
const errorMessage = computed(() => store.submitError || store.error)
const coaches = computed(() => store.coaches)

const form = reactive({
  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: '',
  sex: 'Male',
  weight: '',
  height: '',
  preferredCoach: '',
  address: '',
  homePhone: '',
  mobilePhone: '',
  email: '',
  fatherName: '',
  fatherOccupation: '',
  fatherPhone: '',
  motherName: '',
  motherOccupation: '',
  motherPhone: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  schoolName: '',
  schoolAddress: '',
  contactName: '',
  contactNumber: '',
  medicalConditions: '',
  allergies: '',
  medications: '',
  physicianName: '',
  physicianPhone: '',
  lessonType: props.preselectedType || '',
  skillLevel: 'Beginner',
  previousExperience: '',
  swimmingGoals: '',
  preferredDays: '',
  preferredTime: '',
  startDate: '',
  howDidYouHear: '',
  specialRequests: '',
  agreedToTerms: false,
  agreedToWaiver: false
})

watch(
  () => props.preselectedType,
  (value) => {
    if (value) {
      form.lessonType = value
    }
  }
)

onMounted(async () => {
  if (!store.coaches.length) {
    await store.fetchCoaches()
  }
})

const submit = async () => {
  const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'preferredCoach', 'address', 'email', 'lessonType']
  const missingFields = requiredFields.filter(field => !form[field]?.toString().trim())

  if (missingFields.length > 0) {
    store.setError(`Please fill in all required fields: ${missingFields.join(', ')}`)
    return
  }

  if (!form.agreedToTerms || !form.agreedToWaiver) {
    store.setError('Please accept the terms and waiver to proceed.')
    return
  }

  const payload = {
    ...form,
    emergencyContactName: form.emergencyContactName || form.contactName,
    emergencyContactPhone: form.emergencyContactPhone || form.contactNumber
  }

  const result = await store.submitEnrollment(payload)
  if (result) {
    emit('submit', result)
  }
}
</script>

<style>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 1rem;
  overflow-y: auto;
}

.modal {
  background: #fff;
  border-radius: 14px;
  width: 100%;
  max-width: 900px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-content {
  padding: 1.5rem;
  max-height: 80vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.form-grid {
  display: grid;
  gap: 0.75rem;
}

.form-grid.one {
  grid-template-columns: 1fr;
}

.form-grid.two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-grid.three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-field label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.form-field input,
.form-field select,
.form-field textarea {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #374151;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  background: #e5e7eb;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit {
  background: linear-gradient(135deg, #2b6cb0, #1e40af);
  color: #fff;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-banner {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  font-weight: 600;
}

@media (max-width: 900px) {
  .form-grid.three {
    grid-template-columns: 1fr;
  }
  .form-grid.two {
    grid-template-columns: 1fr;
  }
}
</style>
