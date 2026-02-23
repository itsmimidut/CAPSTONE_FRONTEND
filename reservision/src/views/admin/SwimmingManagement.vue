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
        <!-- Tabs -->
        <div class="tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab"
            @click="activeTab = tab"
            :class="{ active: activeTab === tab }"
          >
            <i :class="getTabIcon(tab)" style="margin-right: 0.5rem;"></i>
            {{ tab }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Students Tab -->
          <div v-if="activeTab === 'Students'">
            <h2 class="section-title">Enrolled Students</h2>
            <div class="table-container">
              <table class="students-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Lesson Type</th>
                    <th>Coach</th>
                    <th>Schedule</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="student in students" :key="student.id">
                    <td><strong>{{ student.name }}</strong></td>
                    <td>{{ student.lessonType }}</td>
                    <td>{{ student.coach }}</td>
                    <td>{{ student.schedule }}</td>
                    <td>
                      <span 
                        :class="{
                          'paid': student.paymentStatus === 'Paid',
                          'pending': student.paymentStatus === 'Pending'
                        }"
                      >
                        {{ student.paymentStatus }}
                      </span>
                    </td>
                    <td>
                      <button @click="approveStudent(student.id)" class="btn-action approve" title="Approve">
                        <i class="fas fa-check"></i>
                      </button>
                      <button @click="markAsPaid(student.id)" class="btn-action pay" title="Mark as Paid">
                        <i class="fas fa-dollar-sign"></i>
                      </button>
                      <button @click="editStudent(student.id)" class="btn-action edit" title="Edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="deleteStudent(student.id)" class="btn-action delete" title="Delete">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="loading && students.length === 0">
                    <td colspan="6" class="text-center">
                      <i class="fas fa-spinner fa-spin"></i> Loading students...
                    </td>
                  </tr>
                  <tr v-if="!loading && students.length === 0">
                    <td colspan="6" class="text-center">No students enrolled yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Schedule & Coaches Tab -->
          <div v-if="activeTab === 'Schedule & Coaches'">
            <h2 class="section-title">Schedules & Coaches</h2>
            <div class="table-container">
              <table class="students-table">
                <thead>
                  <tr>
                    <th>Lesson Type</th>
                    <th>Coach</th>
                    <th>Schedule</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(schedule, index) in schedules" :key="index">
                    <td><strong>{{ schedule.lessonType }}</strong></td>
                    <td>{{ schedule.coach }}</td>
                    <td>{{ schedule.time }}</td>
                    <td>
                      <button @click="editSchedule(index)" class="btn-action edit" title="Edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="deleteSchedule(index)" class="btn-action delete" title="Delete">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="loading && schedules.length === 0">
                    <td colspan="4" class="text-center">
                      <i class="fas fa-spinner fa-spin"></i> Loading schedules...
                    </td>
                  </tr>
                  <tr v-if="!loading && schedules.length === 0">
                    <td colspan="4" class="text-center">No schedules available.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Payments Tab -->
          <div v-if="activeTab === 'Payments'">
            <h2 class="section-title">Payments</h2>
            <div class="table-container">
              <table class="students-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Lesson Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="payment in payments" :key="payment.id">
                    <td><strong>{{ payment.student }}</strong></td>
                    <td>{{ payment.lessonType }}</td>
                    <td><strong>₱{{ payment.amount.toLocaleString() }}</strong></td>
                    <td>
                      <span 
                        :class="{
                          'paid': payment.status === 'Paid',
                          'pending': payment.status === 'Pending'
                        }"
                      >
                        {{ payment.status }}
                      </span>
                    </td>
                    <td>
                      <button @click="markPaymentAsPaid(payment.id)" class="btn-action pay" title="Mark as Paid">
                        <i class="fas fa-dollar-sign"></i>
                      </button>
                      <button @click="deletePayment(payment.id)" class="btn-action delete" title="Delete">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="loading && payments.length === 0">
                    <td colspan="5" class="text-center">
                      <i class="fas fa-spinner fa-spin"></i> Loading payments...
                    </td>
                  </tr>
                  <tr v-if="!loading && payments.length === 0">
                    <td colspan="5" class="text-center">No payment records.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
          schedule: student.available_time || 'To be scheduled',
          paymentStatus: student.payment_status || 'Pending',
          email: student.email,
          phone: student.mobile_phone,
          enrollmentStatus: student.enrollment_status,
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

/* Tabs Styling */
.tabs {
  display: flex;
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
  overflow-x: auto;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.students-table th,
.students-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

.students-table th {
  background: linear-gradient(135deg, #2B6CB0, #1e40af);
  color: white;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.85rem;
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
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  margin-right: 0.5rem;
  cursor: pointer;
  color: white;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
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

.btn-action.pay {
  background: linear-gradient(135deg, #F59E0B, #d97706);
}

.btn-action.edit {
  background: linear-gradient(135deg, #3B82F6, #2563eb);
}

.btn-action.delete {
  background: linear-gradient(135deg, #EF4444, #dc2626);
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
    padding: 0.75rem;
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
