<template>
  <div class="admin-dashboard">
    <!-- Header -->
      <div class="header-container">
        <AdminHeader 
          title="Swimming Management"
          subtitle="Manage Students, Coaches, and Payments"
          @toggle-sidebar="sidebarOpen = !sidebarOpen"
        />
      </div>

    <!-- Sidebar -->
    <AdminSidebar 
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      current-path="/admin/swimming"
      @close="sidebarOpen = false"
    />

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-container">
        <!-- Stats Cards -->
        <div class="stats-cards">
          <div class="stat-card total-card">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">Total Students</span>
              <span class="stat-value">{{ totalStudents }}</span>
            </div>
          </div>

          <div class="stat-card paid-card">
            <div class="stat-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">Paid</span>
              <span class="stat-value">{{ paidStudents }}</span>
            </div>
          </div>

          <div class="stat-card pending-card">
            <div class="stat-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">Pending</span>
              <span class="stat-value">{{ pendingStudents }}</span>
            </div>
          </div>

          <div class="stat-card inactive-card">
            <div class="stat-icon">
              <i class="fas fa-times-circle"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">Inactive</span>
              <span class="stat-value">{{ inactiveStudents }}</span>
            </div>
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="main-layout">
          <!-- Students Section (Left) -->
          <div class="section students-section">
            <h2 class="section-title">Enrolled Students</h2>
            <div class="table-container">
              <table class="students-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Lesson Type</th>
                    <th>Coach</th>
                    <th>Enrollment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="student in students" :key="student.id" @click="selectStudent(student)" class="clickable-row" :class="{ active: selectedStudent?.id === student.id }">
                    <td><strong>{{ student.name }}</strong></td>
                    <td>{{ student.lessonType }}</td>
                    <td>{{ student.coach }}</td>
                    <td>
                      <span 
                        :class="{
                          'active': student.enrollmentStatus === 'Active',
                          'inactive': student.enrollmentStatus === 'Inactive'
                        }"
                      >
                        {{ student.enrollmentStatus }}
                      </span>
                    </td>
                    <td>
                      <button @click.stop="approveStudent(student.id)" class="btn-action approve" title="Approve">
                        <i class="fas fa-check"></i>
                      </button>
                      <button @click.stop="editStudent(student.id)" class="btn-action edit" title="Edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click.stop="deleteStudent(student.id)" class="btn-action delete" title="Delete">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="loading && students.length === 0">
                    <td colspan="5" class="text-center">
                      <i class="fas fa-spinner fa-spin"></i> Loading students...
                    </td>
                  </tr>
                  <tr v-if="!loading && students.length === 0">
                    <td colspan="5" class="text-center">No students enrolled yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Schedules Section (Right) -->
          <div class="section schedules-section">
            <h2 class="section-title">Schedules & Coaches</h2>
            <div class="coaches-wrapper">
              <div v-if="loading && schedules.length === 0" class="loading-message">
                <i class="fas fa-spinner fa-spin"></i> Loading coaches...
              </div>
              <div v-else-if="!loading && schedules.length === 0" class="empty-message">
                No coaches available.
              </div>
              <div v-else>
                <!-- Tabs Navigation -->
                <div class="coaches-tabs">
                  <button 
                    v-for="(schedule, index) in schedules" 
                    :key="index"
                    @click="selectedCoachIndex = index"
                    :class="{ 'active': selectedCoachIndex === index }"
                    class="coach-tab"
                  >
                    <span class="tab-coach-name">{{ schedule.coach }}</span>
                    <span class="tab-coach-type">{{ schedule.lessonType }}</span>
                  </button>
                </div>

                <!-- Coach Form -->
                <div class="coach-form-section">
                  <div v-if="selectedCoachIndex !== null && schedules[selectedCoachIndex]" class="coach-card">
                    <div class="coach-form">
                      <h3 class="form-title">{{ schedules[selectedCoachIndex].coach }}</h3>
                      
                      <div class="form-group">
                        <label class="form-label">Lesson Type</label>
                        <input type="text" class="form-input" :value="schedules[selectedCoachIndex].lessonType" disabled />
                      </div>
                      
                      <div class="form-group">
                        <label class="form-label">Coach Name</label>
                        <input type="text" class="form-input" :value="schedules[selectedCoachIndex].coach" disabled />
                      </div>

                      <div class="form-actions">
                        <button @click="editSchedule(selectedCoachIndex)" class="btn-action edit">
                          <i class="fas fa-edit"></i> Edit
                        </button>
                        <button @click="deleteSchedule(selectedCoachIndex)" class="btn-action delete">
                          <i class="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  <div v-else class="no-coach-selected">
                    <i class="fas fa-user-tie"></i>
                    <p>Select a coach to view details</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Calendar Section -->
        <div class="calendar-section">
          <div class="calendar-header">
            <div>
              <h3>Swimming Schedule Calendar</h3>
              <p class="text-sm text-gray-500">View class schedules by date</p>
            </div>
            <div class="month-navigation">
              <button @click="prevCalendarMonth" class="nav-btn">
                <i class="fas fa-chevron-left"></i>
              </button>
              <span class="current-month">{{ formatMonthYear(currentCalendarDate) }}</span>
              <button @click="nextCalendarMonth" class="nav-btn">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div class="calendar-container">
            <div class="weekdays">
              <div v-for="day in weekDays" :key="day" class="weekday">
                {{ day }}
              </div>
            </div>

            <div class="dates-grid">
              <!-- Empty cells for days before month starts -->
              <div v-for="i in firstDayOfCalendarMonth" :key="`empty-${i}`" class="date-cell empty"></div>

              <!-- Calendar dates -->
              <div
                v-for="date in daysInCalendarMonth"
                :key="date"
                :class="getDayClassSwimming(date)"
                class="date-cell"
              >
                <div class="date-number">{{ date }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Student Details Modal -->
        <div v-if="selectedStudent" class="modal-overlay" @click="selectedStudent = null">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>Student Details</h3>
              <button class="close-btn" @click="selectedStudent = null">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Name</span>
                  <span class="detail-value">{{ selectedStudent.name }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Email</span>
                  <span class="detail-value">{{ selectedStudent.email }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Phone</span>
                  <span class="detail-value">{{ selectedStudent.phone }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Lesson Type</span>
                  <span class="detail-value">{{ selectedStudent.lessonType }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Coach</span>
                  <span class="detail-value">{{ selectedStudent.coach }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Schedule</span>
                  <span class="detail-value">{{ selectedStudent.schedule }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Payment Status</span>
                  <span class="detail-value" :class="{ 'status-paid': selectedStudent.paymentStatus === 'Paid', 'status-pending': selectedStudent.paymentStatus === 'Pending' }">{{ selectedStudent.paymentStatus }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Enrollment Status</span>
                  <span class="detail-value">{{ selectedStudent.enrollmentStatus }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Booking Reference</span>
                  <span class="detail-value">{{ selectedStudent.bookingReference }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import AdminHeader from '../../components/Admin/AdminHeader.vue'
import AdminSidebar from '../../components/Admin/AdminSidebar.vue'

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const activeTab = ref('Students')
const tabs = ['Students', 'Schedule & Coaches', 'Payments']

const students = ref([])
const schedules = ref([])
const payments = ref([])
const loading = ref(false)
const selectedStudent = ref(null)
const selectedCoachIndex = ref(null)

// Computed stats
const totalStudents = computed(() => students.value.length)

const paidStudents = computed(() => 
  students.value.filter(s => s.paymentStatus === 'Paid').length
)

const pendingStudents = computed(() => 
  students.value.filter(s => s.paymentStatus === 'Pending').length
)

const inactiveStudents = computed(() => 
  students.value.filter(s => s.enrollmentStatus === 'Inactive' || s.paymentStatus === 'Unpaid').length
)

// Calendar properties
const currentCalendarDate = ref(new Date())
const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const daysInCalendarMonth = computed(() => {
  return new Date(
    currentCalendarDate.value.getFullYear(),
    currentCalendarDate.value.getMonth() + 1,
    0
  ).getDate()
})

const firstDayOfCalendarMonth = computed(() => {
  return new Date(
    currentCalendarDate.value.getFullYear(),
    currentCalendarDate.value.getMonth(),
    1
  ).getDay()
})

const formatMonthYear = (date) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

const prevCalendarMonth = () => {
  currentCalendarDate.value = new Date(
    currentCalendarDate.value.getFullYear(),
    currentCalendarDate.value.getMonth() - 1
  )
}

const nextCalendarMonth = () => {
  currentCalendarDate.value = new Date(
    currentCalendarDate.value.getFullYear(),
    currentCalendarDate.value.getMonth() + 1
  )
}

const getDayClassSwimming = (date) => {
  const today = new Date()
  const cellDate = new Date(
    currentCalendarDate.value.getFullYear(),
    currentCalendarDate.value.getMonth(),
    date
  )
  
  if (cellDate.toDateString() === today.toDateString()) {
    return 'today'
  }
  if (cellDate < today) {
    return 'past'
  }
  return ''
}

// API base URL
const API_URL = 'http://localhost:8000/api/swimming'

// Fetch all data
const fetchStudents = async () => {
  try {
    loading.value = true
    console.log('Fetching students from:', `${API_URL}/admin/students`)
    
    const response = await fetch(`${API_URL}/admin/students`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('API Response:', data)
    console.log('Students count:', data.count)
    
    if (data.success && data.students) {
      console.log(`Processing ${data.students.length} students`)
      
      // Transform data to match component structure
      students.value = data.students.map(student => {
        console.log('Student data:', student)
        return {
          id: student.enrollment_id,
          name: student.name,
          lessonType: student.lesson_type,
          coach: student.coach,
          paymentStatus: student.payment_status || 'Pending',
          email: student.email,
          phone: student.mobile_phone,
          enrollmentStatus: student.enrollment_status || 'Pending',
          bookingReference: student.booking_reference
        }
      })
      
      console.log('Transformed students:', students.value)
    } else {
      console.error('API response missing success or students:', data)
    }
  } catch (error) {
    console.error('Error fetching students:', error)
    console.error('Error details:', error.message)
    alert(`Failed to load students data: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const fetchSchedules = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/schedules`)
    const data = await response.json()
    
    if (data.success) {
      schedules.value = data.schedules.map(schedule => ({
        lessonType: schedule.specialization || 'All Levels',
        coach: schedule.coach_name,
        time: `${schedule.available_days || 'Flexible'} ${schedule.available_time || ''}`.trim(),
        email: schedule.email,
        phone: schedule.phone
      }))
    }
  } catch (error) {
    console.error('Error fetching schedules:', error)
    alert('Failed to load schedules data')
  }
}

const fetchPayments = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/payments`)
    const data = await response.json()
    
    if (data.success) {
      payments.value = data.payments.map(payment => ({
        id: payment.booking_id,
        student: payment.student_name || 'N/A',
        lessonType: payment.lesson_type || 'N/A',
        amount: parseFloat(payment.amount) || 0,
        status: payment.status || 'Pending',
        bookingReference: payment.booking_reference,
        paymentMethod: payment.payment_method,
        date: payment.booking_date
      }))
    }
  } catch (error) {
    console.error('Error fetching payments:', error)
    alert('Failed to load payments data')
  }
}

// Students actions
const selectStudent = (student) => {
  selectedStudent.value = student
}

const approveStudent = async (id) => {
  try {
    const response = await fetch(`${API_URL}/admin/students/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' })
    })
    
    const result = await response.json()
    
    if (result.success) {
      alert('Student approved successfully!')
      await fetchStudents()
    } else {
      alert(result.error || 'Failed to approve student')
    }
  } catch (error) {
    console.error('Error approving student:', error)
    alert('Failed to approve student')
  }
}

const markAsPaid = (id) => {
  alert('Payment status is managed through the booking system. Please update payment status in the Bookings section.')
}

const editStudent = (id) => {
  const student = students.value.find(s => s.id === id)
  if (student) {
    alert(`Edit functionality coming soon.\n\nStudent: ${student.name}\nEmail: ${student.email}\nPhone: ${student.phone}`)
  }
}

const deleteStudent = async (id) => {
  if (!confirm('Are you sure you want to delete this student enrollment?')) return
  
  try {
    const response = await fetch(`${API_URL}/admin/students/${id}`, {
      method: 'DELETE'
    })
    
    const result = await response.json()
    
    if (result.success) {
      alert('Student enrollment deleted successfully')
      await fetchStudents()
    } else {
      alert(result.error || 'Failed to delete student')
    }
  } catch (error) {
    console.error('Error deleting student:', error)
    alert('Failed to delete student enrollment')
  }
}

// Schedule actions
const editSchedule = (index) => {
  const schedule = schedules.value[index]
  alert(`Edit functionality coming soon.\n\nCoach: ${schedule.coach}\nTime: ${schedule.time}`)
}

const deleteSchedule = (index) => {
  alert('Schedule deletion should be managed through the coach management system.')
}

// Payments actions
const markPaymentAsPaid = (id) => {
  alert('Payment status updates are managed through the main booking system.')
}

const deletePayment = (id) => {
  alert('Payment deletion should be managed through the booking system.')
}

const getTabIcon = (tab) => {
  const icons = {
    'Students': 'fas fa-users',
    'Schedule & Coaches': 'fas fa-calendar-alt',
    'Payments': 'fas fa-credit-card'
  }
  return icons[tab] || 'fas fa-info-circle'
}

// Load data on mount
onMounted(() => {
  fetchStudents()
  fetchSchedules()
  fetchPayments()
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc, #f0f4f8);
  display: flex;
  flex-direction: column;
  position: relative;
}

.admin-dashboard > :first-child {
  position: sticky;
  top: 0;
  z-index: 40;
}

.main-content {
  margin-left: 0;
  padding: 2rem 1rem;
  transition: margin-left 0.3s ease;
  flex: 1;
  z-index: 1;
}

@media (min-width: 768px) {
  .main-content {
    margin-left: 260px;
    padding: 2rem;
  }
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.total-card {
  border-left-color: #3b82f6;
}

.total-card .stat-icon {
  background: #dbeafe;
  color: #1e40af;
}

.paid-card {
  border-left-color: #10b981;
}

.paid-card .stat-icon {
  background: #d1fae5;
  color: #065f46;
}

.pending-card {
  border-left-color: #f59e0b;
}

.pending-card .stat-icon {
  background: #fef3c7;
  color: #92400e;
}

.inactive-card {
  border-left-color: #ef4444;
}

.inactive-card .stat-icon {
  background: #fee2e2;
  color: #991b1b;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
}

/* Main Layout - Two Column */
.main-layout {
  display: grid;
  grid-template-columns: 70% 30%;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 24px;
  background: #2B6CB0;
  border-radius: 2px;
}

/* Clickable Row */
.clickable-row {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-row:hover {
  background-color: #f0f4f8 !important;
}

.clickable-row.active {
  background-color: #dbeafe !important;
  border-left: 4px solid #2B6CB0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #1f2937;
}

.modal-body {
  padding: 1.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.status-paid {
  background: #d1fae5;
  color: #065f46;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  display: inline-block;
  width: fit-content;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  display: inline-block;
  width: fit-content;
}

/* Calendar Section */
.calendar-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.calendar-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
}

.calendar-header p {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-weight: 600;
}

.nav-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.current-month {
  font-weight: 600;
  color: #1f2937;
  min-width: 180px;
  text-align: center;
  font-size: 0.95rem;
}

.calendar-container {
  margin-top: 1rem;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.weekday {
  text-align: center;
  font-weight: 700;
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.5rem;
}

.dates-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.date-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #1f2937;
  cursor: default;
  transition: all 0.2s;
  position: relative;
}

.date-cell.empty {
  background: transparent;
  border: none;
}

.date-cell.past {
  background: #f3f4f6;
  color: #9ca3af;
}

.date-cell.today {
  background: linear-gradient(135deg, #2B6CB0 0%, #1e40af 100%);
  color: white;
  border-color: #2B6CB0;
  font-weight: 700;
}

.date-number {
  font-size: 0.9rem;
}

/* Tabs Styling */
.tabs {
  display: none;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.tabs button {
  padding: 0.75rem 1.25rem;
  border-radius: 8px 8px 0 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  color: #718096;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  position: relative;
  border-bottom: 3px solid transparent;
}

.tabs button:hover {
  color: #2B6CB0;
  background: #f7fafc;
}

.tabs button.active {
  color: #2B6CB0;
  border-bottom-color: #2B6CB0;
  background: #f0f4f8;
}

/* Section Title */
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #2D3748;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 1.5rem;
  background: linear-gradient(180deg, #2B6CB0, #63B3ED);
  border-radius: 2px;
}

/* Table Container */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.08);
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
  table-layout: fixed;
}

.students-table th,
.students-table td {
  padding: 0.3rem 0.3rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.students-table th {
  background: linear-gradient(135deg, #2B6CB0, #1e40af);
  color: white;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-size: 0.75rem;
  white-space: nowrap;
}

.students-table tbody tr {
  transition: all 0.2s ease;
}

.students-table tbody tr:hover {
  background: #f8fbff;
}

.students-table tbody tr:last-child td {
  border-bottom: none;
}

/* Action Buttons */
.btn-action {
  border: none;
  padding: 0.2rem 0.3rem;
  border-radius: 3px;
  margin-right: 0.15rem;
  cursor: pointer;
  color: white;
  font-size: 0.65rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

body {
  overflow-x: hidden;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-action.approve {
  background: linear-gradient(135deg, #22C55E, #16a34a);
}

.btn-action.edit {
  background: linear-gradient(135deg, #3B82F6, #2563eb);
}

.btn-action.delete {
  background: linear-gradient(135deg, #EF4444, #dc2626);
}

/* Coaches Wrapper */
.coaches-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.coaches-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
  overflow-x: auto;
  padding-bottom: 0;
  background: white;
  border-radius: 8px 8px 0 0;
}

.coach-tab {
  padding: 1rem 1.25rem;
  border: none;
  background: #f7fafc;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2d3748;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.coach-tab:hover {
  background: #edf2f7;
  border-bottom-color: #cbd5e0;
}

.coach-tab.active {
  background: white;
  color: #2B6CB0;
  border-bottom-color: #2B6CB0;
}

.tab-coach-name {
  font-weight: 700;
  font-size: 0.9rem;
}

.tab-coach-type {
  font-size: 0.75rem;
  color: #718096;
  font-weight: 500;
}

.coach-tab.active .tab-coach-type {
  color: #2B6CB0;
}

.coach-form-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0 8px 8px 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.coach-card {
  background: white;
  width: 100%;
  box-shadow: none;
  border: none;
  padding: 0;
}

.coach-card:hover {
  box-shadow: none;
  border-color: transparent;
}

.form-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2B6CB0;
  margin-bottom: 1.5rem;
  margin-top: 0;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.coach-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #2d3748;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.form-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 0.8rem;
  background: #f7fafc;
  color: #2d3748;
  cursor: not-allowed;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #2B6CB0;
  background: #ffffff;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.form-actions .btn-action {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  min-width: auto;
  height: auto;
}

.loading-message,
.empty-message {
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-size: 0.9rem;
}

.no-coach-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #cbd5e0;
}

.no-coach-selected i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-coach-selected p {
  font-size: 0.9rem;
  color: #a0aec0;
  margin: 0;
}

.header-container {
  padding: 1rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  top: 0;
  z-index: 50;
  margin-bottom: 10px;
  margin-top:  30px;
}

/* Status Badges */
.paid {
  color: #22C55E;
  font-weight: 700;
  background: #f0fdf4;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  display: inline-block;
}

.pending {
  color: #F59E0B;
  font-weight: 700;
  background: #fffbeb;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  display: inline-block;
}

.text-center {
  text-align: center;
  color: #718096;
  padding: 2rem !important;
}

/* Responsive */
@media (max-width: 640px) {
  .main-content {
    padding: 1rem;
  }
  
  .content-container {
    padding: 0;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
  
  .students-table th,
  .students-table td {
    padding: 0.4rem;
    font-size: 0.9rem;
  }
  
  .btn-action {
    padding: 0.5rem;
    min-width: 32px;
    height: 32px;
    margin-right: 0.25rem;
  }
  
  .tabs {
    gap: 0.25rem;
  }
  
  .tabs button {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
