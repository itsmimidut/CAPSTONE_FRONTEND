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
                  <tr v-if="students.length === 0">
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
                  <tr v-if="schedules.length === 0">
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
                  <tr v-if="payments.length === 0">
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
import { ref } from 'vue'
import AdminHeader from '../../components/Admin/AdminHeader.vue'
import AdminSidebar from '../../components/Admin/AdminSidebar.vue'

const sidebarOpen = ref(false)
const activeTab = ref('Students')
const tabs = ['Students', 'Schedule & Coaches', 'Payments']

// Sample data
const students = ref([
  { id: 1, name: 'Juan Dela Cruz', lessonType: 'Group Lessons', coach: 'Coach Maria', schedule: 'Mon-Fri 8-9AM', paymentStatus: 'Pending' },
  { id: 2, name: 'Ana Santos', lessonType: 'Private Lessons', coach: 'Coach John', schedule: 'Tue & Thu 2-3PM', paymentStatus: 'Paid' },
])

const schedules = ref([
  { lessonType: 'Group Lessons', coach: 'Coach Maria', time: 'Mon-Fri 8-9AM' },
  { lessonType: 'Private Lessons', coach: 'Coach John', time: 'Tue & Thu 2-3PM' },
])

const payments = ref([
  { id: 1, student: 'Juan Dela Cruz', lessonType: 'Group Lessons', amount: 1500, status: 'Pending' },
  { id: 2, student: 'Ana Santos', lessonType: 'Private Lessons', amount: 3500, status: 'Paid' },
])

// Students actions
const approveStudent = (id) => {
  const student = students.value.find(s => s.id === id)
  if(student) student.approved = true
  alert(`${student.name} approved.`)
}

const markAsPaid = (id) => {
  const student = students.value.find(s => s.id === id)
  if(student) student.paymentStatus = 'Paid'
  alert(`${student.name} marked as Paid.`)
}

const editStudent = (id) => {
  const student = students.value.find(s => s.id === id)
  const newName = prompt('Edit student name:', student.name)
  if(newName) student.name = newName
}

const deleteStudent = (id) => {
  if(confirm('Delete this student?')) students.value = students.value.filter(s => s.id !== id)
}

// Schedule actions
const editSchedule = (index) => {
  const newTime = prompt('Edit schedule time:', schedules.value[index].time)
  if(newTime) schedules.value[index].time = newTime
}

const deleteSchedule = (index) => {
  if(confirm('Delete this schedule?')) schedules.value.splice(index,1)
}

// Payments actions
const markPaymentAsPaid = (id) => {
  const payment = payments.value.find(p => p.id === id)
  if(payment) payment.status = 'Paid'
}

const deletePayment = (id) => {
  if(confirm('Delete this payment?')) payments.value = payments.value.filter(p => p.id !== id)
}

const getTabIcon = (tab) => {
  const icons = {
    'Students': 'fas fa-users',
    'Schedule & Coaches': 'fas fa-calendar-alt',
    'Payments': 'fas fa-credit-card'
  }
  return icons[tab] || 'fas fa-info-circle'
}
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
