<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <div class="header-container">
      <AdminHeader 
        title="Swimming Management"
        subtitle="Manage Students, Coaches, and Payments"
        :has-notifications="pendingStudents > 0"
        :pending-count="pendingStudents"
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

        <!-- ───── Stats Row ───── -->
        <div class="stats-grid">
          <div class="stat-card total">
            <div class="stat-icon"><i class="fas fa-users"></i></div>
            <div class="stat-content">
              <span class="stat-label">Total Students</span>
              <span class="stat-value">{{ totalStudents }}</span>
            </div>
          </div>
          <div class="stat-card paid">
            <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
            <div class="stat-content">
              <span class="stat-label">Paid</span>
              <span class="stat-value">{{ paidStudents }}</span>
            </div>
          </div>
          <div class="stat-card pending">
            <div class="stat-icon"><i class="fas fa-clock"></i></div>
            <div class="stat-content">
              <span class="stat-label">Pending</span>
              <span class="stat-value">{{ pendingStudents }}</span>
            </div>
          </div>
          <div class="stat-card inactive">
            <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
            <div class="stat-content">
              <span class="stat-label">Inactive</span>
              <span class="stat-value">{{ inactiveStudents }}</span>
            </div>
          </div>
        </div>

        <!-- ───── TOP ROW: Students (left) + Calendar (right) ───── -->
        <div class="top-row">

          <!-- LEFT — Enrolled Students -->
          <section class="panel students-panel">
            <div class="panel-header">
              <div class="panel-header-left">
                <div class="panel-icon-wrap students-accent">
                  <i class="fas fa-user-graduate"></i>
                </div>
                <div>
                  <h2 class="panel-title">Enrolled Students</h2>
                  <p class="panel-sub">All active enrollments</p>
                </div>
              </div>
              <div class="panel-header-right">
                <span class="count-badge">{{ students.length }} Total</span>
                <button class="icon-btn" title="Filter"><i class="fas fa-filter"></i></button>
                <button class="icon-btn" title="Export"><i class="fas fa-download"></i></button>
              </div>
            </div>

            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Lesson</th>
                    <th>Coach</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="student in students"
                    :key="student.id"
                    @click="selectStudent(student)"
                    class="data-row"
                    :class="{ 'row-active': selectedStudent?.id === student.id }"
                  >
                    <td>
                      <div class="student-cell">
                        <div class="avatar">{{ student.name.charAt(0).toUpperCase() }}</div>
                        <div class="student-meta">
                          <span class="s-name">{{ student.name }}</span>
                          <span class="s-email">{{ student.email || 'No email' }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="pill" :class="{
                        'pill-group': student.lessonType?.toLowerCase().includes('group'),
                        'pill-private': student.lessonType?.toLowerCase().includes('private')
                      }">{{ student.lessonType }}</span>
                    </td>
                    <td>
                      <div class="coach-cell">
                        <i class="fas fa-user-tie"></i>
                        <span>{{ student.coach || 'Unassigned' }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="status-pill" :class="student.enrollmentStatus?.toLowerCase()">
                        <i class="fas" :class="{
                          'fa-check-circle': student.enrollmentStatus === 'Approved',
                          'fa-clock': student.enrollmentStatus === 'Pending',
                          'fa-times-circle': student.enrollmentStatus === 'Inactive'
                        }"></i>
                        {{ student.enrollmentStatus }}
                      </span>
                    </td>
                    <td>
                      <div class="row-actions">
                        <button @click.stop="approveStudent(student.id)" class="act-btn approve" title="Approve">
                          <i class="fas fa-check"></i>
                        </button>
                        <button @click.stop="editStudent(student.id)" class="act-btn edit" title="Edit">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button @click.stop="deleteStudent(student.id)" class="act-btn remove" title="Delete">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="loading && students.length === 0">
                    <td colspan="5">
                      <div class="empty-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Loading students…</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!loading && students.length === 0">
                    <td colspan="5">
                      <div class="empty-state">
                        <i class="fas fa-users-slash"></i>
                        <span>No students enrolled yet</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- RIGHT — Schedule Calendar -->
          <section class="panel calendar-panel">
            <div class="panel-header">
              <div class="panel-header-left">
                <div class="panel-icon-wrap calendar-accent">
                  <i class="fas fa-calendar-alt"></i>
                </div>
                <div>
                  <h2 class="panel-title">Schedule Calendar</h2>
                  <p class="panel-sub">Lesson availability</p>
                </div>
              </div>
              <div class="month-nav">
                <button @click="prevCalendarMonth" class="month-btn">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <span class="month-label">{{ formatMonthYear(currentCalendarDate) }}</span>
                <button @click="nextCalendarMonth" class="month-btn">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>

            <div class="calendar-body">
              <div class="cal-weekdays">
                <span v-for="d in weekDays" :key="d" class="wd">{{ d }}</span>
              </div>
              <div class="cal-grid">
                <div v-for="i in firstDayOfCalendarMonth" :key="`e-${i}`" class="cal-day empty"></div>
                <div
                  v-for="date in daysInCalendarMonth"
                  :key="date"
                  @click="selectCalendarDate(date)"
                  class="cal-day"
                  :class="getDayClass(date)"
                >
                  <span class="day-num">{{ date }}</span>
                  <span v-if="hasLessonsOnDate(date)" class="dot"></span>
                </div>
              </div>

              <!-- Selected Date Panel -->
              <div class="date-lessons" v-if="selectedCalendarDate">
                <div class="date-lessons-header">
                  <i class="fas fa-calendar-day"></i>
                  <span>{{ formatSelectedDate(selectedCalendarDate) }}</span>
                  <span class="lesson-count-badge" v-if="studentsForSelectedDay.length">
                    {{ studentsForSelectedDay.length }} lesson{{ studentsForSelectedDay.length > 1 ? 's' : '' }}
                  </span>
                </div>
                <div class="lessons-scroll">
                  <template v-if="studentsForSelectedDay.length > 0">
                    <div v-for="(lesson, i) in studentsForSelectedDay" :key="i" class="lesson-row">
                      <div class="lesson-time-tag">
                        <i class="fas fa-clock"></i> {{ lesson.time }}
                      </div>
                      <div class="lesson-info">
                        <span class="lesson-name">{{ lesson.name }}</span>
                        <span class="lesson-type-tag">{{ lesson.lessonType }}</span>
                      </div>
                      <div class="lesson-coach-tag">
                        <i class="fas fa-user-tie"></i> {{ lesson.coach }}
                      </div>
                    </div>
                  </template>
                  <div v-else class="empty-state small">
                    <i class="fas fa-calendar-check"></i>
                    <span>No lessons on this day</span>
                  </div>
                </div>
              </div>
              <div v-else class="date-placeholder">
                <i class="fas fa-hand-pointer"></i>
                <span>Select a date to see lessons</span>
              </div>
            </div>
          </section>
        </div>

        <!-- ───── BOTTOM ROW: Schedules & Coaches (full width) ───── -->
        <section class="panel coaches-panel">
          <div class="panel-header coaches-panel-header">
            <div class="panel-header-left">
              <div class="panel-icon-wrap coaches-accent">
                <i class="fas fa-chalkboard-teacher"></i>
              </div>
              <div>
                <h2 class="panel-title">Schedules &amp; Coaches</h2>
                <p class="panel-sub">Manage your coaching team</p>
              </div>
            </div>
            <button @click="openAddCoachModal" class="add-coach-btn">
              <i class="fas fa-plus"></i> Add Coach
            </button>
          </div>

          <!-- Coach Cards Grid -->
          <div class="coaches-grid" v-if="schedules.length > 0">
            <div
              v-for="(coach, index) in schedules"
              :key="index"
              class="coach-card"
              :class="{ 'coach-card--active': currentCoachPage === index }"
              @click="currentCoachPage = index"
            >
              <div class="coach-card-top">
                <div class="coach-ava">{{ coach.coach.charAt(0).toUpperCase() }}</div>
                <div class="coach-card-info">
                  <span class="coach-card-name">{{ coach.coach }}</span>
                  <span class="coach-card-type">{{ coach.lessonType }}</span>
                </div>
              </div>

              <div class="coach-card-details">
                <div class="coach-detail-item" v-if="coach.email">
                  <i class="fas fa-envelope"></i>
                  <span>{{ coach.email }}</span>
                </div>
                <div class="coach-detail-item" v-if="coach.phone">
                  <i class="fas fa-phone"></i>
                  <span>{{ coach.phone }}</span>
                </div>
                <div class="coach-detail-item" v-if="coach.time">
                  <i class="fas fa-clock"></i>
                  <span>{{ coach.time }}</span>
                </div>
              </div>

              <div class="coach-card-actions">
                <button @click.stop="editCoachByIndex(index)" class="cta-edit">
                  <i class="fas fa-edit"></i> Edit
                </button>
                <button @click.stop="deleteCoachByIndex(index)" class="cta-delete">
                  <i class="fas fa-trash"></i> Remove
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="loading" class="empty-state coaches-empty">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading coaches…</span>
          </div>
          <div v-else class="empty-state coaches-empty">
            <i class="fas fa-user-slash"></i>
            <span>No coaches available. Add one to get started.</span>
          </div>
        </section>

        <!-- ───── Add / Edit Coach Modal ───── -->
        <div v-if="showAddCoachModal" class="modal-overlay" @click="closeAddCoachModal">
          <div class="modal-box" @click.stop>
            <div class="modal-head">
              <h3>{{ isEditingCoach ? 'Edit Coach' : 'Add New Coach' }}</h3>
              <button class="close-btn" @click="closeAddCoachModal"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Coach Name <span class="req">*</span></label>
                <input type="text" v-model="newCoach.coach" placeholder="Full name" class="form-input" />
              </div>
              <div class="form-group">
                <label>Lesson Type <span class="req">*</span></label>
                <input type="text" v-model="newCoach.lessonType" placeholder="e.g. Group, Private" class="form-input" />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" v-model="newCoach.email" placeholder="coach@example.com" class="form-input" />
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input type="text" v-model="newCoach.phone" placeholder="Phone number" class="form-input" />
              </div>
            </div>
            <div class="modal-foot">
              <button @click="closeAddCoachModal" class="btn-sec">Cancel</button>
              <button @click="saveCoach" class="btn-pri">
                {{ isEditingCoach ? 'Update Coach' : 'Add Coach' }}
              </button>
            </div>
          </div>
        </div>

        <!-- ───── Student Details Modal ───── -->
        <div v-if="selectedStudent" class="modal-overlay" @click="selectedStudent = null">
          <div class="modal-box modal-box--wide" @click.stop>
            <div class="modal-head">
              <h3>Student Details</h3>
              <button class="close-btn" @click="selectedStudent = null"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
              <div class="student-detail-header">
                <div class="avatar avatar-lg">{{ selectedStudent.name.charAt(0).toUpperCase() }}</div>
                <div>
                  <h4 class="sd-name">{{ selectedStudent.name }}</h4>
                  <span class="status-pill" :class="selectedStudent.enrollmentStatus?.toLowerCase()">
                    {{ selectedStudent.enrollmentStatus }}
                  </span>
                </div>
              </div>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="di-label">Email</span>
                  <span class="di-value">{{ selectedStudent.email || '—' }}</span>
                </div>
                <div class="detail-item">
                  <span class="di-label">Phone</span>
                  <span class="di-value">{{ selectedStudent.phone || '—' }}</span>
                </div>
                <div class="detail-item">
                  <span class="di-label">Lesson Type</span>
                  <span class="di-value">{{ selectedStudent.lessonType }}</span>
                </div>
                <div class="detail-item">
                  <span class="di-label">Coach</span>
                  <span class="di-value">{{ selectedStudent.coach || '—' }}</span>
                </div>
                <div class="detail-item">
                  <span class="di-label">Payment</span>
                  <span class="di-value" :class="selectedStudent.paymentStatus?.toLowerCase()">
                    {{ selectedStudent.paymentStatus }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="di-label">Booking Ref</span>
                  <span class="di-value mono">{{ selectedStudent.bookingReference || '—' }}</span>
                </div>
                <div class="detail-item detail-item--full">
                  <span class="di-label">Schedule</span>
                  <div class="schedule-block">
                    <div v-if="selectedStudent.lessonDatesFormatted?.length" class="sched-row">
                      <i class="fas fa-calendar-alt"></i>
                      <span>{{ selectedStudent.lessonDatesFormatted.join(', ') }}</span>
                    </div>
                    <div v-if="selectedStudent.lessonTimeFormatted" class="sched-row">
                      <i class="fas fa-clock"></i>
                      <span>{{ selectedStudent.lessonTimeFormatted }}</span>
                    </div>
                    <span v-if="!selectedStudent.lessonDatesFormatted?.length && !selectedStudent.lessonTimeFormatted" class="di-value">TBD</span>
                  </div>
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
import { ref, onMounted, computed, watch } from 'vue'
import AdminHeader from '../../components/Admin/AdminHeader.vue'
import AdminSidebar from '../../components/Admin/AdminSidebar.vue'
import { useNotificationStore } from '../../stores/notifications'

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const notifications = useNotificationStore()

const students = ref([])
const schedules = ref([])
const loading = ref(false)
const selectedStudent = ref(null)
const selectedCalendarDate = ref(null)
const currentCoachPage = ref(0)
const showAddCoachModal = ref(false)
const isEditingCoach = ref(false)
const editingIndex = ref(-1)

const newCoach = ref({ lessonType: '', coach: '', email: '', phone: '' })

// ── Computed Stats ──────────────────────────────────────
const totalStudents = computed(() => students.value.length)
const paidStudents = computed(() => students.value.filter(s => s.paymentStatus === 'Paid').length)
const pendingStudents = computed(() => students.value.filter(s => s.enrollmentStatus === 'Pending').length)
const inactiveStudents = computed(() => students.value.filter(s => s.enrollmentStatus === 'Inactive' || s.paymentStatus === 'Unpaid').length)

// ── Calendar ────────────────────────────────────────────
const currentCalendarDate = ref(new Date())
const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const daysInCalendarMonth = computed(() =>
  new Date(currentCalendarDate.value.getFullYear(), currentCalendarDate.value.getMonth() + 1, 0).getDate()
)
const firstDayOfCalendarMonth = computed(() =>
  new Date(currentCalendarDate.value.getFullYear(), currentCalendarDate.value.getMonth(), 1).getDay()
)

const formatMonthYear = (date) => {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}
const formatSelectedDate = (date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
const prevCalendarMonth = () => {
  currentCalendarDate.value = new Date(currentCalendarDate.value.getFullYear(), currentCalendarDate.value.getMonth() - 1)
}
const nextCalendarMonth = () => {
  currentCalendarDate.value = new Date(currentCalendarDate.value.getFullYear(), currentCalendarDate.value.getMonth() + 1)
}
const getDayClass = (date) => {
  const today = new Date()
  const cell = new Date(currentCalendarDate.value.getFullYear(), currentCalendarDate.value.getMonth(), date)
  const classes = []
  if (selectedCalendarDate.value && cell.toDateString() === selectedCalendarDate.value.toDateString()) classes.push('selected')
  if (cell.toDateString() === today.toDateString()) classes.push('today')
  if (cell < today && cell.toDateString() !== today.toDateString()) classes.push('past')
  return classes.join(' ')
}
const hasLessonsOnDate = (date) => {
  const y = currentCalendarDate.value.getFullYear()
  const m = String(currentCalendarDate.value.getMonth() + 1).padStart(2, '0')
  const d = String(date).padStart(2, '0')
  return students.value.some(s => s.lessonDates?.includes(`${y}-${m}-${d}`))
}
const selectCalendarDate = (date) => {
  selectedCalendarDate.value = new Date(currentCalendarDate.value.getFullYear(), currentCalendarDate.value.getMonth(), date)
}
const studentsForSelectedDay = computed(() => {
  if (!selectedCalendarDate.value) return []
  const y = selectedCalendarDate.value.getFullYear()
  const m = String(selectedCalendarDate.value.getMonth() + 1).padStart(2, '0')
  const d = String(selectedCalendarDate.value.getDate()).padStart(2, '0')
  const fmt = `${y}-${m}-${d}`
  return students.value
    .filter(s => s.lessonDates?.includes(fmt))
    .map(s => ({ name: s.name, lessonType: s.lessonType, coach: s.coach, time: s.lessonTime || 'TBD' }))
})

// ── API ─────────────────────────────────────────────────
const API_URL = 'http://localhost:8000/api/swimming'

const fetchStudents = async () => {
  try {
    loading.value = true
    const res = await fetch(`${API_URL}/admin/students`)
    const data = await res.json()
    if (data.success && data.students) {
      students.value = data.students.map(s => ({
        id: s.enrollment_id, name: s.name, lessonType: s.lesson_type,
        coach: s.coach, paymentStatus: s.payment_status || 'Pending',
        email: s.email, phone: s.mobile_phone,
        enrollmentStatus: s.enrollment_status || 'Pending',
        bookingReference: s.booking_reference,
        lessonDates: [], lessonTime: 'TBD',
        lessonDatesFormatted: [], lessonTimeFormatted: 'TBD'
      }))
    }
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const fetchSchedules = async () => {
  try {
    const res = await fetch(`${API_URL}/admin/schedules`)
    const data = await res.json()
    if (data.success) {
      schedules.value = data.schedules.map(s => ({
        lessonType: s.specialization || 'All Levels',
        coach: s.coach_name,
        time: `${s.available_days || 'Flexible'} ${s.available_time || ''}`.trim(),
        email: s.email, phone: s.phone
      }))
    }
  } catch (e) { console.error(e) }
}

const fetchCalendarLessons = async () => {
  try {
    const res = await fetch(`${API_URL}/admin/calendar/lessons`)
    const data = await res.json()
    if (data.success && data.lessons) {
      for (const lesson of data.lessons) {
        const student = students.value.find(s => s.bookingReference === lesson.booking_reference)
        if (student && lesson.dates) {
          student.lessonDates = lesson.dates
          student.lessonTime = lesson.time
          student.coach = lesson.coach_name || student.coach
          student.lessonDatesFormatted = lesson.dates
          student.lessonTimeFormatted = lesson.time
        }
      }
    }
  } catch (e) { console.error(e) }
}

// ── Student Actions ─────────────────────────────────────
const selectStudent = (s) => { selectedStudent.value = s }
const approveStudent = async (id) => {
  try {
    const res = await fetch(`${API_URL}/admin/students/${id}/status`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' })
    })
    const r = await res.json()
    if (r.success) await fetchStudents()
  } catch (e) { console.error(e) }
}
const editStudent = (id) => { console.log('Edit student:', id) }
const deleteStudent = async (id) => {
  if (!confirm('Delete this enrollment?')) return
  try {
    const res = await fetch(`${API_URL}/admin/students/${id}`, { method: 'DELETE' })
    const r = await res.json()
    if (r.success) await fetchStudents()
  } catch (e) { console.error(e) }
}

// ── Coach Actions ───────────────────────────────────────
const openAddCoachModal = () => {
  isEditingCoach.value = false
  editingIndex.value = -1
  newCoach.value = { lessonType: '', coach: '', email: '', phone: '' }
  showAddCoachModal.value = true
}
const closeAddCoachModal = () => {
  showAddCoachModal.value = false
  newCoach.value = { lessonType: '', coach: '', email: '', phone: '' }
}
const editCoachByIndex = (index) => {
  isEditingCoach.value = true
  editingIndex.value = index
  newCoach.value = { ...schedules.value[index] }
  showAddCoachModal.value = true
}
const deleteCoachByIndex = (index) => {
  if (!confirm('Delete this coach?')) return
  schedules.value.splice(index, 1)
  if (currentCoachPage.value >= schedules.value.length) {
    currentCoachPage.value = Math.max(0, schedules.value.length - 1)
  }
}
const saveCoach = () => {
  if (!newCoach.value.coach || !newCoach.value.lessonType) {
    alert('Coach name and lesson type are required.')
    return
  }
  if (isEditingCoach.value && editingIndex.value >= 0) {
    Object.assign(schedules.value[editingIndex.value], newCoach.value)
  } else {
    schedules.value.push({ ...newCoach.value, time: '' })
  }
  closeAddCoachModal()
}

watch(() => pendingStudents.value, (n) => notifications.setSwimmingPending(n))

onMounted(async () => {
  await fetchStudents()
  await fetchCalendarLessons()
  await fetchSchedules()
})
</script>

<style scoped>
/* ── Base ─────────────────────────────────────────────── */
.admin-dashboard {
  min-height: 100vh;
  background: #f0f4f8;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.header-container {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 40;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.main-content {
  padding: 1rem;
  flex: 1;
  margin-top: 80px;
}

@media (min-width: 768px) {
  .main-content { margin-left: 260px; }
}

.content-container {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

/* ── Stats ────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.stat-card {
  background: #fff;
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #e8edf2;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}

.stat-icon {
  width: 52px; height: 52px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; flex-shrink: 0;
}
.stat-card.total .stat-icon  { background: rgba(31,141,191,.1); color: #1F8DBF; }
.stat-card.paid .stat-icon   { background: rgba(46,204,113,.1); color: #2ecc71; }
.stat-card.pending .stat-icon{ background: rgba(244,196,0,.1);  color: #c49b0f; }
.stat-card.inactive .stat-icon{ background: rgba(149,165,166,.1);color: #7f8c8d; }

.stat-label {
  font-size: 0.78rem; font-weight: 600; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.4px;
}
.stat-value {
  font-size: 1.9rem; font-weight: 700; color: #1e293b; line-height: 1.2;
}

/* ── Layout Rows ──────────────────────────────────────── */
.top-row {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 1.75rem;
  align-items: start;
}

/* ── Panel Base ───────────────────────────────────────── */
.panel {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #e8edf2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background: #fafcfe;
}

.panel-header-left {
  display: flex; align-items: center; gap: 0.9rem;
}

.panel-icon-wrap {
  width: 42px; height: 42px;
  border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; flex-shrink: 0;
}
.students-accent { background: rgba(31,141,191,.12); color: #1F8DBF; }
.calendar-accent  { background: rgba(99,102,241,.12); color: #6366f1; }
.coaches-accent   { background: rgba(16,185,129,.12); color: #10b981; }

.panel-title {
  font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0;
}
.panel-sub {
  font-size: 0.78rem; color: #94a3b8; margin: 0.15rem 0 0;
}

.panel-header-right {
  display: flex; align-items: center; gap: 0.5rem;
}

.count-badge {
  font-size: 0.75rem; font-weight: 600;
  background: rgba(31,141,191,.1); color: #1F8DBF;
  padding: 0.25rem 0.75rem; border-radius: 30px;
  border: 1px solid rgba(31,141,191,.2);
}

.icon-btn {
  width: 34px; height: 34px; border-radius: 9px;
  border: 1px solid #e8edf2; background: #fff;
  color: #94a3b8; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; transition: all 0.15s;
}
.icon-btn:hover { border-color: #1F8DBF; color: #1F8DBF; background: rgba(31,141,191,.05); }

/* ── Students Table ───────────────────────────────────── */
.table-wrap {
  overflow-y: auto;
  max-height: 520px;
}

.data-table {
  width: 100%; border-collapse: collapse; font-size: 0.875rem;
}
.data-table th {
  background: #f8fafc; color: #94a3b8;
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.5px; padding: 0.85rem 1rem;
  text-align: left; border-bottom: 1px solid #f1f5f9;
  position: sticky; top: 0; z-index: 1;
}
.data-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f8fafc;
  color: #334155;
}

.data-row { cursor: pointer; transition: background 0.15s; }
.data-row:hover { background: #f8fafc; }
.data-row.row-active { background: rgba(244,196,0,.05); border-left: 3px solid #F4C400; }
.data-row:last-child td { border-bottom: none; }

.student-cell { display: flex; align-items: center; gap: 0.7rem; }
.avatar {
  width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
  background: linear-gradient(135deg, #1F8DBF, #1565c0);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.9rem;
}
.avatar-lg { width: 56px; height: 56px; border-radius: 14px; font-size: 1.4rem; }

.s-name { font-weight: 600; color: #1e293b; display: block; }
.s-email { font-size: 0.75rem; color: #94a3b8; }

.pill {
  display: inline-block; padding: 0.25rem 0.7rem; border-radius: 30px;
  font-size: 0.75rem; font-weight: 600; background: #f1f5f9; color: #64748b;
}
.pill-group   { background: rgba(31,141,191,.1); color: #1F8DBF; }
.pill-private { background: rgba(244,196,0,.1);  color: #b45309; }

.coach-cell { display: flex; align-items: center; gap: 0.4rem; color: #64748b; font-size: 0.85rem; }
.coach-cell i { color: #1F8DBF; font-size: 0.8rem; }

.status-pill {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.25rem 0.7rem; border-radius: 30px;
  font-size: 0.75rem; font-weight: 600;
}
.status-pill.approved { background: rgba(46,204,113,.1); color: #16a34a; }
.status-pill.pending  { background: rgba(244,196,0,.1);  color: #b45309; }
.status-pill.inactive { background: rgba(100,116,139,.1);color: #64748b; }
.status-pill i { font-size: 0.7rem; }

.row-actions { display: flex; gap: 0.3rem; opacity: 0; transition: opacity 0.15s; }
.data-row:hover .row-actions { opacity: 1; }
.act-btn {
  width: 28px; height: 28px; border-radius: 7px;
  border: 1px solid #e8edf2; background: #fff; color: #94a3b8;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; transition: all 0.15s;
}
.act-btn:hover { transform: translateY(-1px); }
.act-btn.approve:hover { background: #22c55e; border-color: #22c55e; color: #fff; }
.act-btn.edit:hover    { background: #1F8DBF; border-color: #1F8DBF; color: #fff; }
.act-btn.remove:hover  { background: #ef4444; border-color: #ef4444; color: #fff; }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 0.6rem; padding: 3rem;
  color: #94a3b8; text-align: center; font-size: 0.9rem;
}
.empty-state i { font-size: 2rem; color: #cbd5e1; }
.empty-state.small { padding: 1.5rem; }
.empty-state.small i { font-size: 1.5rem; }

/* ── Calendar Panel ───────────────────────────────────── */
.calendar-panel .panel-header { flex-wrap: wrap; gap: 0.75rem; }

.month-nav { display: flex; align-items: center; gap: 0.5rem; }
.month-btn {
  width: 30px; height: 30px; border-radius: 8px;
  border: 1px solid #e8edf2; background: #fff; color: #64748b;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.month-btn:hover { background: #6366f1; border-color: #6366f1; color: #fff; }
.month-label { font-weight: 700; color: #1e293b; font-size: 0.9rem; min-width: 130px; text-align: center; }

.calendar-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem; }

.cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.wd { text-align: center; font-size: 0.7rem; font-weight: 700; color: #94a3b8; padding: 0.4rem 0; }

.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
.cal-day {
  aspect-ratio: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  border-radius: 9px; background: #f8fafc;
  border: 1px solid #f1f5f9;
  font-size: 0.82rem; font-weight: 600; color: #334155;
  cursor: pointer; position: relative; transition: all 0.15s; user-select: none;
}
.cal-day.empty { background: transparent; border: none; cursor: default; }
.cal-day:hover:not(.empty) {
  background: rgba(99,102,241,.08); border-color: #6366f1; color: #4f46e5;
}
.cal-day.today  { background: #6366f1; color: #fff; border-color: #6366f1; }
.cal-day.selected { background: #F4C400; color: #1e293b; border-color: #F4C400; }
.cal-day.past { color: #cbd5e1; background: #fff; }

.day-num { line-height: 1; }
.dot {
  position: absolute; bottom: 4px;
  width: 4px; height: 4px; border-radius: 50%;
  background: #F4C400;
}
.cal-day.today .dot { background: #fff; }

/* date lessons */
.date-lessons {
  background: #f8fafc; border-radius: 12px;
  border: 1px solid #f1f5f9; overflow: hidden;
}
.date-lessons-header {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.85rem; font-weight: 700; color: #6366f1;
  border-bottom: 1px solid #f1f5f9;
  background: rgba(99,102,241,.04);
}
.lesson-count-badge {
  margin-left: auto; font-size: 0.7rem; font-weight: 700;
  background: #6366f1; color: #fff;
  padding: 0.15rem 0.55rem; border-radius: 30px;
}
.lessons-scroll { max-height: 180px; overflow-y: auto; padding: 0.5rem; }

.lesson-row {
  padding: 0.65rem 0.75rem; background: #fff; border-radius: 9px;
  margin-bottom: 0.4rem; border-left: 3px solid #6366f1;
  display: flex; flex-direction: column; gap: 0.3rem;
}
.lesson-row:last-child { margin-bottom: 0; }
.lesson-time-tag {
  font-size: 0.7rem; color: #94a3b8;
  display: flex; align-items: center; gap: 0.3rem;
}
.lesson-info { display: flex; justify-content: space-between; align-items: center; }
.lesson-name { font-weight: 700; font-size: 0.83rem; color: #1e293b; }
.lesson-type-tag {
  font-size: 0.68rem; padding: 0.15rem 0.45rem; border-radius: 30px;
  background: #f1f5f9; color: #64748b;
}
.lesson-coach-tag { font-size: 0.72rem; color: #94a3b8; display: flex; align-items: center; gap: 0.3rem; }
.lesson-coach-tag i { color: #6366f1; font-size: 0.65rem; }

.date-placeholder {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.5rem; padding: 1.5rem; color: #94a3b8;
  font-size: 0.85rem; text-align: center;
  background: #f8fafc; border-radius: 12px; border: 1px dashed #e2e8f0;
}
.date-placeholder i { font-size: 1.4rem; color: #cbd5e1; }

/* ── Coaches Panel (full-width bottom) ────────────────── */
.coaches-panel { width: 100%; }

.coaches-panel-header { padding: 1.25rem 1.5rem; }

.add-coach-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: #10b981; color: #fff; border: none;
  padding: 0.5rem 1.1rem; border-radius: 10px;
  font-weight: 600; font-size: 0.88rem; cursor: pointer;
  transition: all 0.15s;
}
.add-coach-btn:hover { background: #059669; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16,185,129,.3); }

.coaches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
}

.coach-card {
  background: #f8fafc; border: 1.5px solid #e8edf2;
  border-radius: 16px; padding: 1.25rem;
  display: flex; flex-direction: column; gap: 1rem;
  cursor: pointer; transition: all 0.2s;
}
.coach-card:hover {
  border-color: #10b981; box-shadow: 0 4px 14px rgba(16,185,129,.12);
  transform: translateY(-2px);
}
.coach-card--active {
  border-color: #10b981;
  background: rgba(16,185,129,.04);
  box-shadow: 0 4px 14px rgba(16,185,129,.1);
}

.coach-card-top { display: flex; align-items: center; gap: 0.8rem; }
.coach-ava {
  width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(135deg, #10b981, #0d9488);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1.2rem;
}
.coach-card-name { font-weight: 700; color: #1e293b; font-size: 0.95rem; display: block; }
.coach-card-type {
  font-size: 0.75rem; font-weight: 600;
  background: rgba(16,185,129,.1); color: #059669;
  padding: 0.15rem 0.55rem; border-radius: 30px; display: inline-block; margin-top: 0.2rem;
}

.coach-card-details { display: flex; flex-direction: column; gap: 0.45rem; }
.coach-detail-item {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.8rem; color: #64748b;
}
.coach-detail-item i { color: #10b981; font-size: 0.75rem; width: 14px; text-align: center; }

.coach-card-actions { display: flex; gap: 0.5rem; margin-top: auto; }
.cta-edit, .cta-delete {
  flex: 1; padding: 0.45rem; border-radius: 8px;
  font-size: 0.8rem; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 0.35rem;
  transition: all 0.15s; border: 1.5px solid;
}
.cta-edit   { background: rgba(31,141,191,.08); color: #1F8DBF; border-color: rgba(31,141,191,.25); }
.cta-edit:hover { background: #1F8DBF; color: #fff; border-color: #1F8DBF; }
.cta-delete { background: rgba(239,68,68,.08); color: #ef4444; border-color: rgba(239,68,68,.25); }
.cta-delete:hover { background: #ef4444; color: #fff; border-color: #ef4444; }

.coaches-empty { padding: 3rem; }

/* ── Modals ───────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,.55); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; animation: fadeIn 0.2s;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-box {
  background: #fff; border-radius: 22px;
  width: 90%; max-width: 480px; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 24px 48px rgba(0,0,0,.15);
  animation: slideUp 0.25s ease;
}
.modal-box--wide { max-width: 560px; }
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.modal-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.4rem 1.5rem; border-bottom: 1px solid #f1f5f9;
}
.modal-head h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e293b; }
.close-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid #e8edf2; background: #fff; color: #94a3b8;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.close-btn:hover { background: #fef2f2; color: #ef4444; border-color: #fca5a5; }

.modal-body { padding: 1.5rem; }
.modal-foot {
  padding: 1.25rem 1.5rem; border-top: 1px solid #f1f5f9;
  display: flex; gap: 0.75rem; justify-content: flex-end;
}

.form-group { margin-bottom: 1.1rem; }
.form-group label {
  display: block; font-size: 0.78rem; font-weight: 700; color: #64748b;
  margin-bottom: 0.45rem; text-transform: uppercase; letter-spacing: 0.4px;
}
.req { color: #ef4444; margin-left: 2px; }
.form-input {
  width: 100%; padding: 0.7rem 0.95rem;
  border: 1.5px solid #e8edf2; border-radius: 10px;
  font-size: 0.92rem; color: #1e293b; transition: all 0.15s;
  box-sizing: border-box;
}
.form-input:focus { outline: none; border-color: #1F8DBF; box-shadow: 0 0 0 3px rgba(31,141,191,.1); }

.btn-pri {
  background: #1F8DBF; color: #fff; border: none;
  padding: 0.6rem 1.3rem; border-radius: 10px; font-weight: 600;
  font-size: 0.9rem; cursor: pointer; transition: all 0.15s;
}
.btn-pri:hover { background: #1a7aa8; transform: translateY(-1px); }
.btn-sec {
  background: #fff; color: #64748b; border: 1.5px solid #e8edf2;
  padding: 0.6rem 1.3rem; border-radius: 10px; font-weight: 600;
  font-size: 0.9rem; cursor: pointer; transition: all 0.15s;
}
.btn-sec:hover { border-color: #94a3b8; }

/* Student detail modal */
.student-detail-header {
  display: flex; align-items: center; gap: 1rem;
  margin-bottom: 1.5rem; padding-bottom: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}
.sd-name { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin: 0 0 0.4rem; }

.detail-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;
}
.detail-item { display: flex; flex-direction: column; gap: 0.35rem; }
.detail-item--full { grid-column: span 2; }
.di-label { font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4px; }
.di-value { font-size: 0.95rem; font-weight: 500; color: #1e293b; }
.di-value.paid { color: #16a34a; }
.di-value.pending { color: #b45309; }
.mono { font-family: monospace; font-size: 0.85rem; color: #6366f1; }

.schedule-block {
  display: flex; flex-direction: column; gap: 0.5rem;
  padding: 0.85rem; background: #f8fafc; border-radius: 10px;
}
.sched-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; color: #475569; }
.sched-row i { color: #1F8DBF; width: 16px; }

/* ── Responsive ───────────────────────────────────────── */
@media (max-width: 1100px) {
  .top-row { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .calendar-panel .panel-header { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 640px) {
  .main-content { padding: 1rem; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .coaches-grid { grid-template-columns: 1fr; }
  .detail-grid { grid-template-columns: 1fr; }
  .detail-item--full { grid-column: span 1; }
  .row-actions { opacity: 1; }
}
</style>