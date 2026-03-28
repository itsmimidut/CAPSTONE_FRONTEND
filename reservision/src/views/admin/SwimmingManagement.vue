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
                <span class="count-badge">{{ filteredStudents.length }} / {{ students.length }} Total</span>
                <button
                  class="icon-btn"
                  :class="{ active: showStudentFilters }"
                  title="Filter"
                  @click="showStudentFilters = !showStudentFilters"
                ><i class="fas fa-filter"></i></button>
                <button class="icon-btn" title="Attendance List" @click="openAttendancePreview"><i class="fas fa-clipboard-check"></i></button>
                <button class="icon-btn" title="Export" @click="openSwimmingReportPreview"><i class="fas fa-download"></i></button>
              </div>
            </div>

            <div v-if="showStudentFilters" class="students-filter-bar">
              <div class="filter-field filter-field--search">
                <i class="fas fa-search"></i>
                <input
                  v-model.trim="studentSearchQuery"
                  type="text"
                  placeholder="Search student, email, coach, or booking ref"
                />
              </div>

              <div class="filter-field">
                <select v-model="studentStatusFilter">
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div class="filter-field">
                <select v-model="studentLessonFilter">
                  <option value="all">All Lesson Types</option>
                  <option v-for="lesson in lessonTypeOptions" :key="lesson" :value="lesson">
                    {{ lesson }}
                  </option>
                </select>
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
                    v-for="student in filteredStudents"
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
                          'fa-times-circle': student.enrollmentStatus === 'Inactive',
                          'fa-flag-checkered': student.enrollmentStatus?.toLowerCase() === 'completed'
                        }"></i>
                        {{ student.enrollmentStatus?.toLowerCase() === 'completed' ? 'Completed' : student.enrollmentStatus }}
                      </span>
                    </td>
                    <td>
                      <div class="row-actions">
                        <button
                          @click.stop="approveStudent(student.id)"
                          class="act-btn approve"
                          title="Approve"
                          :disabled="student.enrollmentStatus?.toLowerCase() === 'approved' || student.enrollmentStatus?.toLowerCase() === 'completed'"
                          :class="{ 'act-btn--disabled': student.enrollmentStatus?.toLowerCase() === 'approved' || student.enrollmentStatus?.toLowerCase() === 'completed' }"
                        >
                          <i class="fas fa-check"></i>
                        </button>
                        <button
                          @click.stop="editStudent(student.id)"
                          class="act-btn edit"
                          title="Schedule Training"
                          :disabled="student.enrollmentStatus?.toLowerCase() === 'approved' || student.enrollmentStatus?.toLowerCase() === 'completed'"
                          :class="{ 'act-btn--disabled': student.enrollmentStatus?.toLowerCase() === 'approved' || student.enrollmentStatus?.toLowerCase() === 'completed' }"
                        >
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
                  <tr v-else-if="!loading && students.length === 0">
                    <td colspan="5">
                      <div class="empty-state">
                        <i class="fas fa-users-slash"></i>
                        <span>No students enrolled yet</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="!loading && filteredStudents.length === 0">
                    <td colspan="5">
                      <div class="empty-state">
                        <i class="fas fa-filter-circle-xmark"></i>
                        <span>No students match your current filters</span>
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

        <!-- ───── Schedule Training Modal ───── -->
        <div v-if="showScheduleModal" class="modal-overlay" @click.self="showScheduleModal = false">
          <div class="modal-box modal-box--schedule" @click.stop>
            <div class="modal-head">
              <h3>
                <i class="fas fa-calendar-alt" style="color:var(--color-primary-light);margin-right:6px"></i>
                Schedule Training
                <span v-if="scheduleModalStudent" class="sched-modal-student-name"> — {{ scheduleModalStudent.name }}</span>
              </h3>
              <button class="close-btn" @click="showScheduleModal = false"><i class="fas fa-times"></i></button>
            </div>

            <div class="modal-body sched-modal-body">
              <!-- Session counter -->
              <div class="sched-counter">
                <span class="sched-counter-label"><i class="fas fa-layer-group"></i> Sessions selected</span>
                <span class="sched-counter-value" :class="{ 'sched-counter-max': scheduleForm.dates.length >= 10 }">
                  {{ scheduleForm.dates.length }} / 10
                </span>
              </div>

              <!-- Mini calendar -->
              <div class="sched-cal">
                <div class="sched-cal-header">
                  <button type="button" @click="prevScheduleMonth" class="month-btn"><i class="fas fa-chevron-left"></i></button>
                  <span class="month-label">{{ formatMonthYear(scheduleCalendarDate) }}</span>
                  <button type="button" @click="nextScheduleMonth" class="month-btn"><i class="fas fa-chevron-right"></i></button>
                </div>
                <div class="cal-weekdays">
                  <span v-for="d in weekDays" :key="d" class="wd">{{ d }}</span>
                </div>
                <div class="cal-grid">
                  <div v-for="i in scheduleFirstDay" :key="`sched-empty-${i}`" class="cal-day empty"></div>
                  <div
                    v-for="day in scheduleMonthDays"
                    :key="`sched-day-${day}`"
                    class="cal-day"
                    :class="{
                      'sched-day--selected': isSchedDateSelected(day),
                      'sched-day--past': isSchedDatePast(day),
                      'sched-day--maxed': !isSchedDateSelected(day) && scheduleForm.dates.length >= 10
                    }"
                    @click="toggleSchedDate(day)"
                  >
                    <span class="day-num">{{ day }}</span>
                  </div>
                </div>
              </div>

              <!-- Selected date chips -->
              <div v-if="sortedScheduleDates.length" class="sched-chips">
                <span
                  v-for="dateStr in sortedScheduleDates"
                  :key="dateStr"
                  class="sched-chip"
                  @click="scheduleForm.dates.splice(scheduleForm.dates.indexOf(dateStr), 1)"
                  title="Click to remove"
                >
                  {{ formatSchedDate(dateStr) }} <i class="fas fa-times"></i>
                </span>
              </div>
              <p v-else class="sched-hint">Click dates on the calendar above to add training sessions (max 10)</p>

              <!-- Time slot -->
              <div class="form-group" style="margin-top:0.5rem">
                <label>Time Slot <span class="req">*</span></label>
                <select v-model="scheduleForm.time" class="form-input">
                  <option value="">Select time slot</option>
                  <option value="6:00 AM - 7:00 AM">6:00 AM – 7:00 AM</option>
                  <option value="8:00 AM - 9:00 AM">8:00 AM – 9:00 AM</option>
                  <option value="10:00 AM - 11:00 AM">10:00 AM – 11:00 AM</option>
                  <option value="2:00 PM - 3:00 PM">2:00 PM – 3:00 PM</option>
                  <option value="4:00 PM - 5:00 PM">4:00 PM – 5:00 PM</option>
                </select>
              </div>

              <!-- Coach assignment -->
              <div class="form-group">
                <label>Assign Coach</label>
                <select v-model="scheduleForm.coach" class="form-input">
                  <option value="">Keep current ({{ scheduleModalStudent?.coach || 'Unassigned' }})</option>
                  <option v-for="c in schedules" :key="c.coach" :value="c.coach">{{ c.coach }}</option>
                </select>
              </div>
            </div>

            <div class="modal-foot">
              <button @click="showScheduleModal = false" class="btn-sec">Cancel</button>
              <button @click="saveSchedule" class="btn-pri" :disabled="savingSchedule">
                <i :class="savingSchedule ? 'fas fa-spinner fa-spin' : 'fas fa-save'" style="margin-right:5px"></i>
                {{ savingSchedule ? 'Saving…' : 'Save Schedule' }}
              </button>
            </div>
          </div>
        </div>

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

        <!-- ───── Attendance Preview Modal ───── -->
        <div v-if="showAttendancePreview" class="modal-overlay" @click="showAttendancePreview = false">
          <div class="modal-box modal-box--attendance" @click.stop>
            <div class="modal-head">
              <h3>Attendance List Preview</h3>
              <button class="close-btn" @click="showAttendancePreview = false"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body attendance-preview-body">
              <div class="attendance-preview-meta">
                <span><strong>{{ attendancePreviewRows.length }}</strong> enrolled students with booking reference</span>
                <button class="btn-pri" @click="exportAttendanceList">
                  <i class="fas fa-file-excel" style="margin-right:6px"></i> Download Excel
                </button>
              </div>

              <div v-if="attendancePreviewRows.length" class="attendance-preview-wrap">
                <table class="attendance-preview-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Booking Ref</th>
                      <th>Student</th>
                      <th>Lesson</th>
                      <th>Coach</th>
                      <th>Session Dates</th>
                      <th>Time Slot</th>
                      <th>Attendance</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in attendancePreviewRows" :key="`${row.bookingRef}-${idx}`">
                      <td>{{ idx + 1 }}</td>
                      <td class="mono">{{ row.bookingRef }}</td>
                      <td>{{ row.studentName }}</td>
                      <td>{{ row.lessonType }}</td>
                      <td>{{ row.coach }}</td>
                      <td>{{ row.scheduleDates }}</td>
                      <td>{{ row.timeSlot }}</td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="empty-state small">
                <i class="fas fa-clipboard"></i>
                <span>No attendance rows to preview for current filters</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ───── Swimming Report Preview Modal ───── -->
        <div v-if="showSwimmingReportPreview" class="modal-overlay" @click="showSwimmingReportPreview = false">
          <div class="modal-box modal-box--attendance" @click.stop>
            <div class="modal-head">
              <h3>Swimming Report Preview</h3>
              <button class="close-btn" @click="showSwimmingReportPreview = false"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body attendance-preview-body">
              <div class="attendance-preview-meta">
                <span>
                  <strong>{{ swimmingReportPreview.totalStudents }}</strong> students | 
                  Paid: <strong>{{ swimmingReportPreview.paid }}</strong> | 
                  Pending: <strong>{{ swimmingReportPreview.pending }}</strong>
                </span>
                <button class="btn-pri" @click="exportSwimmingReport">
                  <i class="fas fa-file-excel" style="margin-right:6px"></i> Download Excel
                </button>
              </div>

              <div v-if="swimmingReportPreview.totalStudents" class="report-preview-grid">
                <div class="preview-card">
                  <h4>Status Breakdown</h4>
                  <table class="attendance-preview-table">
                    <thead>
                      <tr><th>Status</th><th>Count</th><th>%</th></tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in swimmingReportPreview.statusRows" :key="`status-${row.label}`">
                        <td>{{ row.label }}</td>
                        <td>{{ row.count }}</td>
                        <td>{{ row.pct }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="preview-card">
                  <h4>Lesson Breakdown</h4>
                  <table class="attendance-preview-table">
                    <thead>
                      <tr><th>Lesson</th><th>Count</th><th>%</th></tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in swimmingReportPreview.lessonRows" :key="`lesson-${row.label}`">
                        <td>{{ row.label }}</td>
                        <td>{{ row.count }}</td>
                        <td>{{ row.pct }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-if="swimmingReportPreview.totalStudents" class="attendance-preview-wrap">
                <table class="attendance-preview-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Lesson</th>
                      <th>Coach</th>
                      <th>Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(student, idx) in swimmingReportPreview.rows" :key="`report-row-${student.id}-${idx}`">
                      <td>{{ idx + 1 }}</td>
                      <td>{{ student.name || 'N/A' }}</td>
                      <td>{{ student.email || '-' }}</td>
                      <td>{{ student.lessonType || '-' }}</td>
                      <td>{{ student.coach || '-' }}</td>
                      <td>{{ roleLabelFromStatus(student.enrollmentStatus) }}</td>
                      <td>{{ student.paymentStatus || 'Pending' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-else class="empty-state small">
                <i class="fas fa-file-lines"></i>
                <span>No rows to preview for current filters</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import AdminHeader from '../../components/Admin/AdminHeader.vue'
import AdminSidebar from '../../components/Admin/AdminSidebar.vue'
import { useNotificationStore } from '../../stores/notifications'

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const notifications = useNotificationStore()
let autoCompleteIntervalId = null

const students = ref([])
const schedules = ref([])
const loading = ref(false)
const selectedStudent = ref(null)
const selectedCalendarDate = ref(null)
const currentCoachPage = ref(0)
const showAddCoachModal = ref(false)
const isEditingCoach = ref(false)
const editingIndex = ref(-1)
const showStudentFilters = ref(false)
const studentSearchQuery = ref('')
const studentStatusFilter = ref('all')
const studentLessonFilter = ref('all')
const showAttendancePreview = ref(false)
const showSwimmingReportPreview = ref(false)

const newCoach = ref({ lessonType: '', coach: '', email: '', phone: '' })

// ── Computed Stats ──────────────────────────────────────
const totalStudents = computed(() => students.value.length)
const paidStudents = computed(() => students.value.filter(s => s.paymentStatus === 'Paid').length)
const pendingStudents = computed(() => students.value.filter(s => s.enrollmentStatus === 'Pending').length)
const inactiveStudents = computed(() => students.value.filter(s => s.enrollmentStatus === 'Inactive' || s.paymentStatus === 'Unpaid').length)

const lessonTypeOptions = computed(() => {
  const unique = new Set(
    students.value
      .map(s => (s.lessonType || '').trim())
      .filter(Boolean)
  )
  return Array.from(unique).sort((a, b) => a.localeCompare(b))
})

const filteredStudents = computed(() => {
  const q = studentSearchQuery.value.toLowerCase()
  return students.value.filter((student) => {
    const status = (student.enrollmentStatus || '').toLowerCase()
    const lessonType = (student.lessonType || '').trim()

    const matchesSearch = !q || [
      student.name,
      student.email,
      student.coach,
      student.bookingReference
    ].some(value => String(value || '').toLowerCase().includes(q))

    const matchesStatus = studentStatusFilter.value === 'all' || status === studentStatusFilter.value
    const matchesLesson = studentLessonFilter.value === 'all' || lessonType === studentLessonFilter.value

    return matchesSearch && matchesStatus && matchesLesson
  })
})

const clearStudentFilters = () => {
  studentSearchQuery.value = ''
  studentStatusFilter.value = 'all'
  studentLessonFilter.value = 'all'
}

const normalizeDateKey = (value) => {
  if (!value) return ''
  const raw = String(value).trim()
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/)
  if (match) return match[1]

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return ''

  const y = parsed.getFullYear()
  const m = String(parsed.getMonth() + 1).padStart(2, '0')
  const d = String(parsed.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const normalizeDateList = (dates) => {
  if (Array.isArray(dates)) {
    return dates.map(normalizeDateKey).filter(Boolean)
  }

  if (typeof dates === 'string') {
    try {
      const parsed = JSON.parse(dates)
      if (Array.isArray(parsed)) return parsed.map(normalizeDateKey).filter(Boolean)
    } catch (_) {
      const single = normalizeDateKey(dates)
      return single ? [single] : []
    }
  }

  return []
}

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
  selectedCalendarDate.value = null
}
const nextCalendarMonth = () => {
  currentCalendarDate.value = new Date(currentCalendarDate.value.getFullYear(), currentCalendarDate.value.getMonth() + 1)
  selectedCalendarDate.value = null
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

const isCalendarActiveStudent = (student) => {
  const status = (student?.enrollmentStatus || '').toLowerCase()
  return status !== 'completed' && status !== 'cancelled'
}

const hasLessonsOnDate = (date) => {
  const y = currentCalendarDate.value.getFullYear()
  const m = String(currentCalendarDate.value.getMonth() + 1).padStart(2, '0')
  const d = String(date).padStart(2, '0')
  const targetDate = `${y}-${m}-${d}`
  return students.value.some(s => isCalendarActiveStudent(s) && normalizeDateList(s.lessonDates).includes(targetDate))
}
const selectCalendarDate = (date) => {
  selectedCalendarDate.value = new Date(currentCalendarDate.value.getFullYear(), currentCalendarDate.value.getMonth(), date)
}
const studentsForSelectedDay = computed(() => {
  if (!selectedCalendarDate.value) return []
  const y = selectedCalendarDate.value.getFullYear()
  const m = String(selectedCalendarDate.value.getMonth() + 1).padStart(2, '0')
  const d = String(selectedCalendarDate.value.getDate()).padStart(2, '0')
  const targetDate = `${y}-${m}-${d}`
  return students.value
    .filter(s => isCalendarActiveStudent(s) && normalizeDateList(s.lessonDates).includes(targetDate))
    .map(s => ({ name: s.name, lessonType: s.lessonType, coach: s.coach, time: s.lessonTime || 'TBD' }))
})

// ── Helpers ────────────────────────────────────────────
const isScheduleFinished = (student) => {
  if (!student.lessonDates || student.lessonDates.length === 0) return false
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return student.lessonDates.every(d => new Date(d + 'T00:00:00') < today)
}

const autoMarkCompleted = async () => {
  const toMark = students.value.filter(
    s => isScheduleFinished(s) && s.enrollmentStatus?.toLowerCase() !== 'completed' && s.enrollmentStatus?.toLowerCase() !== 'cancelled'
  )
  if (!toMark.length) return

  for (const student of toMark) {
    try {
      await fetch(`${API_URL}/admin/students/${student.id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      })
      student.enrollmentStatus = 'Completed'
      student.lessonDates = []
      student.lessonDatesFormatted = []
      student.lessonTime = 'TBD'
      student.lessonTimeFormatted = 'TBD'
    } catch (e) { console.error('autoMarkCompleted error:', e) }
  }
}

// ── API ─────────────────────────────────────────────────
const API_URL = 'http://localhost:8000/api/swimming'

const fetchStudents = async () => {
  try {
    loading.value = true
    const res = await fetch(`${API_URL}/admin/students`)
    const data = await res.json()
    if (data.success && data.students) {
      students.value = data.students.map(s => {
        let lessonDates = []
        try {
          if (s.lesson_dates) {
            lessonDates = typeof s.lesson_dates === 'string'
              ? JSON.parse(s.lesson_dates)
              : (Array.isArray(s.lesson_dates) ? s.lesson_dates : [])
          }
        } catch (_) {}
        lessonDates = normalizeDateList(lessonDates)
        const status = (s.enrollment_status || 'Pending').toLowerCase()
        if (status === 'completed') {
          lessonDates = []
        }
        return {
          id: s.enrollment_id, name: s.name, lessonType: s.lesson_type,
          coach: s.coach, paymentStatus: s.payment_status || 'Pending',
          email: s.email, phone: s.mobile_phone,
          enrollmentStatus: s.enrollment_status || 'Pending',
          bookingReference: s.booking_reference,
          lessonDates,
          lessonTime: s.lesson_time || 'TBD',
          lessonDatesFormatted: lessonDates,
          lessonTimeFormatted: s.lesson_time || 'TBD'
        }
      })
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
        const normalizedDates = normalizeDateList(lesson.dates)
        if (student && isCalendarActiveStudent(student) && normalizedDates.length) {
          student.lessonDates = normalizedDates
          student.lessonTime = lesson.time
          student.coach = lesson.coach_name || student.coach
          student.lessonDatesFormatted = normalizedDates
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
const editStudent = (id) => {
  const student = students.value.find(s => s.id === id)
  if (!student) return
  scheduleModalStudent.value = student
  scheduleForm.value = {
    dates: [...(student.lessonDates || [])],
    time: student.lessonTime && student.lessonTime !== 'TBD' ? student.lessonTime : '',
    coach: student.coach || ''
  }
  scheduleCalendarDate.value = new Date()
  showScheduleModal.value = true
}
const deleteStudent = async (id) => {
  if (!confirm('Delete this enrollment?')) return
  try {
    const res = await fetch(`${API_URL}/admin/students/${id}`, { method: 'DELETE' })
    const r = await res.json()
    if (r.success) await fetchStudents()
  } catch (e) { console.error(e) }
}

// ── Schedule Modal ──────────────────────────────────────
const showScheduleModal = ref(false)
const scheduleModalStudent = ref(null)
const scheduleForm = ref({ dates: [], time: '', coach: '' })
const scheduleCalendarDate = ref(new Date())
const savingSchedule = ref(false)

const scheduleMonthDays = computed(() =>
  new Date(scheduleCalendarDate.value.getFullYear(), scheduleCalendarDate.value.getMonth() + 1, 0).getDate()
)
const scheduleFirstDay = computed(() =>
  new Date(scheduleCalendarDate.value.getFullYear(), scheduleCalendarDate.value.getMonth(), 1).getDay()
)
const sortedScheduleDates = computed(() => [...scheduleForm.value.dates].sort())

const prevScheduleMonth = () => {
  scheduleCalendarDate.value = new Date(scheduleCalendarDate.value.getFullYear(), scheduleCalendarDate.value.getMonth() - 1)
}
const nextScheduleMonth = () => {
  scheduleCalendarDate.value = new Date(scheduleCalendarDate.value.getFullYear(), scheduleCalendarDate.value.getMonth() + 1)
}
const getSchedDateStr = (day) => {
  const y = scheduleCalendarDate.value.getFullYear()
  const m = String(scheduleCalendarDate.value.getMonth() + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${y}-${m}-${d}`
}
const isSchedDateSelected = (day) => scheduleForm.value.dates.includes(getSchedDateStr(day))
const isSchedDatePast = (day) => {
  const cell = new Date(scheduleCalendarDate.value.getFullYear(), scheduleCalendarDate.value.getMonth(), day)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return cell < today
}
const toggleSchedDate = (day) => {
  if (isSchedDatePast(day)) return
  const dateStr = getSchedDateStr(day)
  const idx = scheduleForm.value.dates.indexOf(dateStr)
  if (idx >= 0) {
    scheduleForm.value.dates.splice(idx, 1)
  } else {
    if (scheduleForm.value.dates.length >= 10) return
    scheduleForm.value.dates.push(dateStr)
  }
}
const formatSchedDate = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const saveSchedule = async () => {
  if (!scheduleForm.value.dates.length) { alert('Please select at least one training date.'); return }
  if (!scheduleForm.value.time) { alert('Please select a time slot.'); return }
  savingSchedule.value = true
  try {
    const res = await fetch(`${API_URL}/admin/students/${scheduleModalStudent.value.id}/schedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lesson_dates: scheduleForm.value.dates,
        lesson_time: scheduleForm.value.time,
        assigned_coach: scheduleForm.value.coach || null
      })
    })
    const r = await res.json()
    if (!r.success) throw new Error(r.error)
    const student = students.value.find(s => s.id === scheduleModalStudent.value.id)
    if (student) {
      student.lessonDates = [...scheduleForm.value.dates]
      student.lessonDatesFormatted = [...scheduleForm.value.dates]
      student.lessonTime = scheduleForm.value.time
      student.lessonTimeFormatted = scheduleForm.value.time
      if (scheduleForm.value.coach) student.coach = scheduleForm.value.coach
      if (isScheduleFinished(student) && student.enrollmentStatus?.toLowerCase() !== 'completed') {
        student.enrollmentStatus = 'Completed'
      }
    }
    showScheduleModal.value = false
    await autoMarkCompleted()
  } catch (e) { alert('Error saving schedule: ' + e.message) } finally { savingSchedule.value = false }
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

const toFiniteNumber = value => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const safeCurrency = value => `₱${toFiniteNumber(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const roleLabelFromStatus = status => {
  const s = String(status || '').toLowerCase()
  if (s === 'approved') return 'Approved'
  if (s === 'pending') return 'Pending'
  if (s === 'inactive') return 'Inactive'
  if (s === 'completed') return 'Completed'
  if (s === 'cancelled') return 'Cancelled'
  return status || 'N/A'
}

const formatAttendanceDates = (student) => {
  const dates = Array.isArray(student.lessonDatesFormatted) && student.lessonDatesFormatted.length
    ? student.lessonDatesFormatted
    : normalizeDateList(student.lessonDates)

  if (!dates.length) return 'TBD'

  return dates
    .map(dateStr => {
      const dt = new Date(`${dateStr}T00:00:00`)
      if (Number.isNaN(dt.getTime())) return dateStr
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    })
    .join(', ')
}

const buildAttendanceRows = () => filteredStudents.value
  .filter(student => String(student.bookingReference || '').trim().length > 0)
  .map(student => ({
    bookingRef: student.bookingReference,
    studentName: student.name || 'N/A',
    email: student.email || '-',
    phone: student.phone || '-',
    lessonType: student.lessonType || '-',
    coach: student.coach || 'Unassigned',
    scheduleDates: formatAttendanceDates(student),
    timeSlot: student.lessonTimeFormatted || student.lessonTime || 'TBD',
    enrollmentStatus: roleLabelFromStatus(student.enrollmentStatus),
    paymentStatus: student.paymentStatus || 'Pending',
    attendance: '',
    remarks: ''
  }))

const attendancePreviewRows = computed(() => buildAttendanceRows())

const swimmingReportPreview = computed(() => {
  const rows = filteredStudents.value

  const paid = rows.filter(s => String(s.paymentStatus || '').toLowerCase() === 'paid').length
  const pending = rows.filter(s => String(s.enrollmentStatus || '').toLowerCase() === 'pending').length

  const statusCounts = rows.reduce((acc, s) => {
    const key = String(s.enrollmentStatus || 'Pending').toLowerCase()
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const lessonCounts = rows.reduce((acc, s) => {
    const key = String(s.lessonType || 'N/A').trim() || 'N/A'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const total = rows.length || 1

  const statusRows = Object.entries(statusCounts)
    .map(([status, count]) => ({
      label: roleLabelFromStatus(status),
      count,
      pct: `${((count / total) * 100).toFixed(2)}%`
    }))
    .sort((a, b) => b.count - a.count)

  const lessonRows = Object.entries(lessonCounts)
    .map(([lesson, count]) => ({
      label: lesson,
      count,
      pct: `${((count / total) * 100).toFixed(2)}%`
    }))
    .sort((a, b) => b.count - a.count)

  return {
    rows,
    totalStudents: rows.length,
    paid,
    pending,
    statusRows,
    lessonRows
  }
})

const openAttendancePreview = () => {
  if (!attendancePreviewRows.value.length) {
    alert('No enrolled students with booking reference found for current filters.')
    return
  }
  showAttendancePreview.value = true
}

const openSwimmingReportPreview = () => {
  if (!swimmingReportPreview.value.totalStudents) {
    alert('No students found for current filters.')
    return
  }
  showSwimmingReportPreview.value = true
}

const exportAttendanceList = async () => {
  try {
    const attendanceRows = buildAttendanceRows()

    if (!attendanceRows.length) {
      alert('No enrolled students with booking reference found for current filters.')
      return
    }

    const ExcelJS = (await import('exceljs')).default
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "Eduardo's Resort"
    workbook.created = new Date()

    const ws = workbook.addWorksheet('Attendance List', {
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 }
    })

    ws.columns = [
      { width: 6 },
      { width: 18 },
      { width: 22 },
      { width: 24 },
      { width: 14 },
      { width: 18 },
      { width: 18 },
      { width: 30 },
      { width: 16 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 18 }
    ]

    const C_DARK_BLUE = 'FF0C3B5E'
    const C_HDR_BG = 'FFE8F4FD'
    const C_TBL_HDR = 'FFF0F6FB'
    const C_WHITE = 'FFFFFFFF'
    const C_ROW_ALT = 'FFF8FBFF'
    const C_CARD_BDR = 'FFDCE8F3'
    const C_GREY_TEXT = 'FF64748B'

    const bdr = c => ({ style: 'thin', color: { argb: c } })
    const cardBorder = { top: bdr(C_CARD_BDR), bottom: bdr(C_CARD_BDR), left: bdr(C_CARD_BDR), right: bdr(C_CARD_BDR) }

    ws.mergeCells('A1:B1')
    ws.mergeCells('C1:I1')
    ws.mergeCells('J1:K1')
    ws.mergeCells('L1:M1')

    const logo = ws.getCell('A1')
    logo.value = 'ER'
    logo.font = { bold: true, size: 14, color: { argb: C_WHITE }, name: 'Calibri' }
    logo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_DARK_BLUE } }
    logo.alignment = { horizontal: 'center', vertical: 'middle' }
    logo.border = cardBorder

    const title = ws.getCell('C1')
    title.value = "Swimming Attendance List"
    title.font = { bold: true, size: 14, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    title.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }

    const generatedLabel = ws.getCell('J1')
    generatedLabel.value = 'Generated'
    generatedLabel.font = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    generatedLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    generatedLabel.alignment = { horizontal: 'right', vertical: 'middle' }

    const generatedValue = ws.getCell('L1')
    generatedValue.value = new Date().toLocaleString('en-PH', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    generatedValue.font = { bold: true, size: 9, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    generatedValue.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    generatedValue.alignment = { horizontal: 'left', vertical: 'middle' }
    ws.getRow(1).height = 28

    ws.mergeCells('A2:M2')
    const subtitle = ws.getCell('A2')
    subtitle.value = `Enrolled students with booking reference | Status: ${studentStatusFilter.value === 'all' ? 'All' : roleLabelFromStatus(studentStatusFilter.value)} | Lesson: ${studentLessonFilter.value === 'all' ? 'All' : studentLessonFilter.value} | Search: ${studentSearchQuery.value || 'None'}`
    subtitle.font = { italic: true, size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    subtitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    subtitle.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
    ws.getRow(2).height = 18

    const headers = [
      'No.',
      'Booking Ref',
      'Student Name',
      'Email',
      'Phone',
      'Lesson Type',
      'Coach',
      'Session Dates',
      'Time Slot',
      'Enrollment',
      'Payment',
      'Attendance',
      'Remarks'
    ]

    const headerRow = ws.getRow(4)
    headers.forEach((text, index) => {
      const cell = headerRow.getCell(index + 1)
      cell.value = text
      cell.font = { bold: true, size: 9, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_TBL_HDR } }
      cell.border = cardBorder
      cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
    })
    headerRow.height = 22

    attendanceRows.forEach((row, index) => {
      const alt = index % 2 === 1
      const excelRow = ws.addRow([
        index + 1,
        row.bookingRef,
        row.studentName,
        row.email,
        row.phone,
        row.lessonType,
        row.coach,
        row.scheduleDates,
        row.timeSlot,
        row.enrollmentStatus,
        row.paymentStatus,
        row.attendance,
        row.remarks
      ])

      excelRow.height = 20
      excelRow.eachCell((cell, colIdx) => {
        cell.font = { size: 9, name: 'Calibri' }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: alt ? C_ROW_ALT : C_WHITE } }
        cell.border = cardBorder
        cell.alignment = { horizontal: colIdx === 1 ? 'center' : 'left', vertical: 'middle', wrapText: colIdx === 8 || colIdx === 13 }
      })
    })

    const totalRow = ws.addRow(['', '', '', '', '', '', '', '', '', '', '', '', ''])
    totalRow.getCell(1).value = 'Total with Booking'
    totalRow.getCell(1).font = { bold: true, size: 9, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    totalRow.getCell(2).value = attendanceRows.length
    totalRow.getCell(2).font = { bold: true, size: 9, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    totalRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_TBL_HDR } }
      cell.border = cardBorder
      cell.alignment = { vertical: 'middle' }
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `Swimming_Attendance_List_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export attendance list:', error)
    alert('Failed to export attendance list. Please try again.')
  }
}

const exportSwimmingReport = async () => {
  try {
    const ExcelJS = (await import('exceljs')).default
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "Eduardo's Resort"
    workbook.created = new Date()

    const ws = workbook.addWorksheet('Swimming Report', {
      pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1 }
    })

    ws.columns = [
      { width: 24 },
      { width: 28 },
      { width: 20 },
      { width: 18 },
      { width: 18 },
      { width: 16 }
    ]

    const C_DARK_BLUE = 'FF0C3B5E'
    const C_LOGO_BG = 'FF0C3B5E'
    const C_HDR_BG = 'FFE8F4FD'
    const C_TBL_HDR = 'FFF0F6FB'
    const C_CARD_BDR = 'FFDCE8F3'
    const C_WHITE = 'FFFFFFFF'
    const C_ROW_ALT = 'FFF8FBFF'
    const C_GREY_TEXT = 'FF64748B'

    const bdr = c => ({ style: 'thin', color: { argb: c } })
    const cardBorder = { top: bdr(C_CARD_BDR), bottom: bdr(C_CARD_BDR), left: bdr(C_CARD_BDR), right: bdr(C_CARD_BDR) }

    const secHdr = (cell, text) => {
      cell.value = text
      cell.font = { bold: true, size: 10, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_TBL_HDR } }
      cell.border = cardBorder
      cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
    }

    const th = (cell, text, right = false) => {
      cell.value = text
      cell.font = { bold: true, size: 10, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_TBL_HDR } }
      cell.border = cardBorder
      cell.alignment = { horizontal: right ? 'right' : 'left', indent: right ? 0 : 1 }
    }

    const td = (cell, value, right = false, bold = false, alt = false) => {
      cell.value = value
      cell.font = { size: 10, name: 'Calibri', bold }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: alt ? C_ROW_ALT : C_WHITE } }
      cell.border = cardBorder
      cell.alignment = { horizontal: right ? 'right' : 'left', indent: right ? 0 : 1 }
    }

    const rows = filteredStudents.value
    const statusCounts = rows.reduce((acc, s) => {
      const status = String(s.enrollmentStatus || 'Pending').toLowerCase()
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    const lessonCounts = rows.reduce((acc, s) => {
      const lesson = String(s.lessonType || 'N/A').trim() || 'N/A'
      acc[lesson] = (acc[lesson] || 0) + 1
      return acc
    }, {})

    const estimatedRevenue = rows.reduce((sum, s) => {
      const raw = String(s.paymentStatus || '').toLowerCase() === 'paid' ? 500 : 0
      return sum + raw
    }, 0)

    const generatedAt = new Date().toLocaleString('en-PH', {
      month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })

    let r = 1

    ws.getCell(`A${r}`).value = 'ER'
    ws.getCell(`A${r}`).font = { bold: true, size: 14, color: { argb: C_WHITE }, name: 'Calibri' }
    ws.getCell(`A${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_LOGO_BG } }
    ws.getCell(`A${r}`).alignment = { horizontal: 'center', vertical: 'middle' }
    ws.getCell(`A${r}`).border = cardBorder

    ws.mergeCells(`B${r}:D${r}`)
    ws.getCell(`B${r}`).value = "Eduardo's Resort"
    ws.getCell(`B${r}`).font = { bold: true, size: 15, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    ws.getCell(`B${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    ws.getCell(`B${r}`).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }

    ws.getCell(`E${r}`).value = 'Generated'
    ws.getCell(`E${r}`).font = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    ws.getCell(`E${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    ws.getCell(`E${r}`).alignment = { horizontal: 'right' }

    ws.getCell(`F${r}`).value = generatedAt
    ws.getCell(`F${r}`).font = { bold: true, size: 9, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    ws.getCell(`F${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    ws.getCell(`F${r}`).alignment = { horizontal: 'right' }
    ws.getRow(r).height = 28
    r++

    ws.mergeCells(`A${r}:F${r}`)
    ws.getCell(`A${r}`).value = 'Swimming Management Report'
    ws.getCell(`A${r}`).font = { italic: true, size: 10, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    ws.getCell(`A${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    ws.getCell(`A${r}`).alignment = { horizontal: 'left', indent: 1 }
    ws.getRow(r).height = 16
    r++

    ws.mergeCells(`A${r}:C${r}`)
    ws.getCell(`A${r}`).value = `Status Filter: ${studentStatusFilter.value === 'all' ? 'All' : roleLabelFromStatus(studentStatusFilter.value)}`
    ws.getCell(`A${r}`).font = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    ws.getCell(`A${r}`).alignment = { horizontal: 'left', indent: 1 }
    ws.mergeCells(`D${r}:F${r}`)
    ws.getCell(`D${r}`).value = `Lesson Filter: ${studentLessonFilter.value === 'all' ? 'All' : studentLessonFilter.value}`
    ws.getCell(`D${r}`).font = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    ws.getCell(`D${r}`).alignment = { horizontal: 'left', indent: 1 }
    r++

    ws.mergeCells(`A${r}:F${r}`)
    ws.getCell(`A${r}`).value = `Search: ${studentSearchQuery.value || 'None'}`
    ws.getCell(`A${r}`).font = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    ws.getCell(`A${r}`).alignment = { horizontal: 'left', indent: 1 }
    r++

    r++

    const cards = [
      { label: 'TOTAL STUDENTS', value: String(rows.length) },
      { label: 'PAID', value: String(rows.filter(s => String(s.paymentStatus || '').toLowerCase() === 'paid').length) },
      { label: 'PENDING', value: String(rows.filter(s => String(s.enrollmentStatus || '').toLowerCase() === 'pending').length) },
      { label: 'EST. REVENUE', value: safeCurrency(estimatedRevenue) }
    ]
    const cardCols = ['A', 'B', 'C', 'D']

    cards.forEach(({ label }, i) => {
      const cell = ws.getCell(`${cardCols[i]}${r}`)
      cell.value = label
      cell.font = { size: 8, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } }
      cell.border = { top: bdr(C_CARD_BDR), left: bdr(C_CARD_BDR), right: bdr(C_CARD_BDR), bottom: { style: 'hair', color: { argb: C_CARD_BDR } } }
      cell.alignment = { horizontal: 'left', indent: 1 }
    })
    ws.getRow(r).height = 14
    r++

    cards.forEach(({ value }, i) => {
      const cell = ws.getCell(`${cardCols[i]}${r}`)
      cell.value = value
      cell.font = { bold: true, size: 12, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } }
      cell.border = { bottom: bdr(C_CARD_BDR), left: bdr(C_CARD_BDR), right: bdr(C_CARD_BDR), top: { style: 'hair', color: { argb: C_CARD_BDR } } }
      cell.alignment = { horizontal: 'left', indent: 1, vertical: 'middle' }
    })
    ws.getRow(r).height = 22
    r++

    r++

    ws.mergeCells(`A${r}:F${r}`)
    secHdr(ws.getCell(`A${r}`), 'Enrollment Status Breakdown')
    ws.getRow(r).height = 16
    r++

    th(ws.getCell(`A${r}`), 'Status')
    th(ws.getCell(`B${r}`), 'Count', true)
    th(ws.getCell(`C${r}`), 'Percent', true)
    r++

    const statusRows = Object.entries(statusCounts)
      .map(([status, count]) => ({ status: roleLabelFromStatus(status), count }))
      .sort((a, b) => b.count - a.count)

    statusRows.forEach((row, i) => {
      const alt = i % 2 === 1
      const pct = rows.length ? `${((row.count / rows.length) * 100).toFixed(2)}%` : '0.00%'
      td(ws.getCell(`A${r}`), row.status, false, false, alt)
      td(ws.getCell(`B${r}`), row.count, true, false, alt)
      td(ws.getCell(`C${r}`), pct, true, false, alt)
      r++
    })

    if (!statusRows.length) {
      td(ws.getCell(`A${r}`), 'No students found for current filters')
      ws.mergeCells(`A${r}:C${r}`)
      r++
    }

    r++

    ws.mergeCells(`A${r}:F${r}`)
    secHdr(ws.getCell(`A${r}`), 'Lesson Type Breakdown')
    ws.getRow(r).height = 16
    r++

    th(ws.getCell(`A${r}`), 'Lesson Type')
    th(ws.getCell(`B${r}`), 'Count', true)
    th(ws.getCell(`C${r}`), 'Percent', true)
    r++

    const lessonRows = Object.entries(lessonCounts)
      .map(([lessonType, count]) => ({ lessonType, count }))
      .sort((a, b) => b.count - a.count)

    lessonRows.forEach((row, i) => {
      const alt = i % 2 === 1
      const pct = rows.length ? `${((row.count / rows.length) * 100).toFixed(2)}%` : '0.00%'
      td(ws.getCell(`A${r}`), row.lessonType, false, false, alt)
      td(ws.getCell(`B${r}`), row.count, true, false, alt)
      td(ws.getCell(`C${r}`), pct, true, false, alt)
      r++
    })

    if (!lessonRows.length) {
      td(ws.getCell(`A${r}`), 'No lesson data available')
      ws.mergeCells(`A${r}:C${r}`)
      r++
    }

    r++

    ws.mergeCells(`A${r}:F${r}`)
    secHdr(ws.getCell(`A${r}`), 'Students List')
    ws.getRow(r).height = 16
    r++

    th(ws.getCell(`A${r}`), 'Name')
    th(ws.getCell(`B${r}`), 'Email')
    th(ws.getCell(`C${r}`), 'Lesson')
    th(ws.getCell(`D${r}`), 'Coach')
    th(ws.getCell(`E${r}`), 'Status')
    th(ws.getCell(`F${r}`), 'Payment')
    r++

    rows.forEach((student, i) => {
      const alt = i % 2 === 1
      td(ws.getCell(`A${r}`), student.name || 'N/A', false, false, alt)
      td(ws.getCell(`B${r}`), student.email || '-', false, false, alt)
      td(ws.getCell(`C${r}`), student.lessonType || '-', false, false, alt)
      td(ws.getCell(`D${r}`), student.coach || '-', false, false, alt)
      td(ws.getCell(`E${r}`), roleLabelFromStatus(student.enrollmentStatus), false, false, alt)
      td(ws.getCell(`F${r}`), student.paymentStatus || 'Pending', false, false, alt)
      r++
    })

    if (!rows.length) {
      td(ws.getCell(`A${r}`), 'No students found for current filters')
      ws.mergeCells(`A${r}:F${r}`)
      r++
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `Swimming_Management_Report_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export swimming report:', error)
    alert('Failed to export swimming report. Please try again.')
  }
}

watch(() => pendingStudents.value, (n) => notifications.setSwimmingPending(n))

onMounted(async () => {
  await fetchStudents()
  await fetchCalendarLessons()
  await autoMarkCompleted()
  await fetchSchedules()

  // Keep statuses in sync when dates become past while the page is open.
  autoCompleteIntervalId = setInterval(() => {
    autoMarkCompleted()
  }, 60000)
})

onUnmounted(() => {
  if (autoCompleteIntervalId) {
    clearInterval(autoCompleteIntervalId)
    autoCompleteIntervalId = null
  }
})
</script>

<style scoped>
/* ── Eduardo's Resort Color Palette ──────────────────── */
:root,
.admin-dashboard {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-white-soft:    rgba(255,255,255,0.1);
  --color-gray-bg:       #f9fafb;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

/* ── Base ─────────────────────────────────────────────── */
.admin-dashboard {
  min-height: 100vh;
  background: var(--color-gray-bg);
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.header-container {
  background: var(--color-navy);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 40;
  box-shadow: 0 2px 12px rgba(12,59,94,0.25);
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
  background: var(--color-white);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--color-gray-border);
  box-shadow: 0 1px 4px rgba(3,105,161,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(3,105,161,0.1);
}

/* Accent stripe on left */
.stat-card::before {
  content: '';
  position: absolute;
  left: 0; top: 12px; bottom: 12px;
  width: 3px;
  border-radius: 0 3px 3px 0;
}
.stat-card { position: relative; }
.stat-card.total::before  { background: var(--color-primary-light); }
.stat-card.paid::before   { background: #22c55e; }
.stat-card.pending::before{ background: var(--color-gold); }
.stat-card.inactive::before{ background: var(--color-text-light); }

.stat-icon {
  width: 52px; height: 52px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; flex-shrink: 0;
}
.stat-card.total .stat-icon   { background: rgba(3,105,161,.1);    color: var(--color-primary); }
.stat-card.paid .stat-icon    { background: rgba(34,197,94,.1);     color: #16a34a; }
.stat-card.pending .stat-icon { background: rgba(244,196,0,.12);    color: #92700a; }
.stat-card.inactive .stat-icon{ background: rgba(107,114,128,.1);   color: var(--color-text-light); }

.stat-content { display: flex; flex-direction: column; }
.stat-label {
  font-size: 0.78rem; font-weight: 600; color: var(--color-text-light);
  text-transform: uppercase; letter-spacing: 0.4px;
}
.stat-value {
  font-size: 1.9rem; font-weight: 700; color: var(--color-text-dark); line-height: 1.2;
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
  background: var(--color-white);
  border-radius: 18px;
  border: 1px solid var(--color-gray-border);
  box-shadow: 0 2px 8px rgba(3,105,161,0.05);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-gray-border);
  background: #fafcff;
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
/* Students: primary blue */
.students-accent { background: rgba(3,105,161,.1); color: var(--color-primary); }
/* Calendar: gold accent */
.calendar-accent  { background: rgba(244,196,0,.12); color: #92700a; }
/* Coaches: navy */
.coaches-accent   { background: rgba(12,59,94,.1); color: var(--color-navy); }

.panel-title {
  font-size: 1rem; font-weight: 700; color: var(--color-text-dark); margin: 0;
}
.panel-sub {
  font-size: 0.78rem; color: var(--color-text-light); margin: 0.15rem 0 0;
}

.panel-header-right {
  display: flex; align-items: center; gap: 0.5rem;
}

.count-badge {
  font-size: 0.75rem; font-weight: 600;
  background: rgba(3,105,161,.08); color: var(--color-primary);
  padding: 0.25rem 0.75rem; border-radius: 30px;
  border: 1px solid rgba(3,105,161,.18);
}

.icon-btn {
  width: 34px; height: 34px; border-radius: 9px;
  border: 1px solid var(--color-gray-border); background: var(--color-white);
  color: var(--color-text-light); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; transition: all 0.15s;
}
.icon-btn:hover {
  border-color: var(--color-primary-light);
  color: var(--color-primary-light);
  background: rgba(31,141,191,.06);
}
.icon-btn.active {
  border-color: var(--color-primary-light);
  color: var(--color-primary);
  background: rgba(31,141,191,.1);
}

.students-filter-bar {
  display: grid;
  grid-template-columns: minmax(220px, 1.6fr) minmax(150px, 1fr) minmax(160px, 1fr) auto;
  gap: 0.6rem;
  padding: 0.85rem 1.5rem;
  border-bottom: 1px solid var(--color-gray-border);
  background: #f8fbff;
}

.filter-field {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-gray-border);
  border-radius: 9px;
  background: var(--color-white);
  min-height: 38px;
}

.filter-field--search {
  gap: 0.4rem;
  padding: 0 0.7rem;
}

.filter-field--search i {
  color: var(--color-text-light);
  font-size: 0.8rem;
}

.filter-field--search input,
.filter-field select {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--color-text-dark);
  font-size: 0.84rem;
  outline: none;
  padding: 0 0.6rem;
}

.filter-field--search input {
  padding: 0;
}

.clear-filter-btn {
  border: 1px solid var(--color-gray-border);
  background: var(--color-white);
  color: var(--color-text-light);
  border-radius: 9px;
  padding: 0 0.95rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.clear-filter-btn:hover {
  border-color: var(--color-primary-light);
  color: var(--color-primary);
}

/* ── Students Table ───────────────────────────────────── */
.table-wrap {
  overflow-y: auto;
  max-height: 520px;
}

.data-table {
  width: 100%; border-collapse: collapse; font-size: 0.875rem;
}
.data-table th {
  background: #f0f6fb; color: var(--color-text-light);
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.5px; padding: 0.85rem 1rem;
  text-align: left; border-bottom: 1px solid var(--color-gray-border);
  position: sticky; top: 0; z-index: 1;
}
.data-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f3f6f9;
  color: var(--color-text-dark);
}

.data-row { cursor: pointer; transition: background 0.15s; }
.data-row:hover { background: #f0f6fb; }
/* Active row highlighted with gold left border */
.data-row.row-active {
  background: rgba(244,196,0,.06);
  border-left: 3px solid var(--color-gold);
}
.data-row:last-child td { border-bottom: none; }

.student-cell { display: flex; align-items: center; gap: 0.7rem; }
.avatar {
  width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-navy));
  color: var(--color-white);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.9rem;
}
.avatar-lg { width: 56px; height: 56px; border-radius: 14px; font-size: 1.4rem; }

.s-name  { font-weight: 600; color: var(--color-text-dark); display: block; }
.s-email { font-size: 0.75rem; color: var(--color-text-light); }

.pill {
  display: inline-block; padding: 0.25rem 0.7rem; border-radius: 30px;
  font-size: 0.75rem; font-weight: 600;
  background: #f1f5f9; color: #64748b;
}
/* Group = primary blue */
.pill-group   { background: rgba(3,105,161,.1);   color: var(--color-primary); }
/* Private = gold */
.pill-private { background: rgba(244,196,0,.12);  color: #92700a; }

.coach-cell { display: flex; align-items: center; gap: 0.4rem; color: var(--color-text-light); font-size: 0.85rem; }
.coach-cell i { color: var(--color-primary-light); font-size: 0.8rem; }

.status-pill {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.25rem 0.7rem; border-radius: 30px;
  font-size: 0.75rem; font-weight: 600;
}
.status-pill.approved   { background: rgba(34,197,94,.1);   color: #16a34a; }
.status-pill.pending    { background: rgba(244,196,0,.12);  color: #92700a; }
.status-pill.inactive   { background: rgba(107,114,128,.1); color: var(--color-text-light); }
/* Completed = navy */
.status-pill.completed  { background: rgba(12,59,94,.1);    color: var(--color-navy); }
.status-pill.cancelled  { background: rgba(239,68,68,.1);   color: #ef4444; }
.status-pill i { font-size: 0.7rem; }

.act-btn--disabled { opacity: 0.3 !important; cursor: not-allowed !important; pointer-events: none; }

.row-actions { display: flex; gap: 0.3rem; transition: opacity 0.15s; }
.data-row:hover .row-actions { opacity: 1; }
.act-btn {
  width: 28px; height: 28px; border-radius: 7px;
  border: 1px solid var(--color-gray-border);
  background: var(--color-white); color: var(--color-text-light);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; transition: all 0.15s;
}
.act-btn:hover { transform: translateY(-1px); }
.act-btn.approve:hover { background: #22c55e; border-color: #22c55e; color: #fff; }
.act-btn.edit:hover    { background: var(--color-primary-light); border-color: var(--color-primary-light); color: #fff; }
.act-btn.remove:hover  { background: #ef4444; border-color: #ef4444; color: #fff; }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 0.6rem; padding: 3rem;
  color: var(--color-text-light); text-align: center; font-size: 0.9rem;
}
.empty-state i { font-size: 2rem; color: var(--color-gray-border); }
.empty-state.small { padding: 1.5rem; }
.empty-state.small i { font-size: 1.5rem; }

/* ── Calendar Panel ───────────────────────────────────── */
.calendar-panel .panel-header {
  flex-wrap: nowrap;
  gap: 0.75rem;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}
.month-btn {
  width: 30px; height: 30px; border-radius: 8px;
  border: 1px solid var(--color-gray-border);
  background: var(--color-white); color: var(--color-text-light);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
/* Gold hover on calendar nav */
.month-btn:hover { background: var(--color-gold); border-color: var(--color-gold); color: var(--color-navy); }
.month-label { font-weight: 700; color: var(--color-text-dark); font-size: 0.9rem; min-width: 130px; text-align: center; }

.calendar-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem; }

.cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.wd { text-align: center; font-size: 0.7rem; font-weight: 700; color: var(--color-text-light); padding: 0.4rem 0; }

.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
.cal-day {
  aspect-ratio: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  border-radius: 9px; background: var(--color-gray-bg);
  border: 1px solid var(--color-gray-border);
  font-size: 0.82rem; font-weight: 600; color: var(--color-text-dark);
  cursor: pointer; position: relative; transition: all 0.15s; user-select: none;
}
.cal-day.empty { background: transparent; border: none; cursor: default; }
.cal-day:hover:not(.empty) {
  background: rgba(3,105,161,.08);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
/* Today = navy */
.cal-day.today    { background: var(--color-navy); color: var(--color-white); border-color: var(--color-navy); }
/* Selected = gold */
.cal-day.selected { background: var(--color-gold); color: var(--color-navy); border-color: var(--color-gold-dark); }
.cal-day.past     { color: #c1c8d0; background: var(--color-white); }

.day-num { line-height: 1; }
.dot {
  position: absolute; bottom: 4px;
  width: 4px; height: 4px; border-radius: 50%;
  background: var(--color-gold-dark);
}
.cal-day.today .dot    { background: var(--color-gold); }
.cal-day.selected .dot { background: var(--color-navy); }

/* date lessons */
.date-lessons {
  background: var(--color-gray-bg); border-radius: 12px;
  border: 1px solid var(--color-gray-border); overflow: hidden;
}
.date-lessons-header {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.85rem; font-weight: 700; color: var(--color-primary);
  border-bottom: 1px solid var(--color-gray-border);
  background: rgba(3,105,161,.04);
}
.lesson-count-badge {
  margin-left: auto; font-size: 0.7rem; font-weight: 700;
  background: var(--color-primary); color: var(--color-white);
  padding: 0.15rem 0.55rem; border-radius: 30px;
}
.lessons-scroll { max-height: 180px; overflow-y: auto; padding: 0.5rem; }

.lesson-row {
  padding: 0.65rem 0.75rem; background: var(--color-white); border-radius: 9px;
  margin-bottom: 0.4rem;
  /* Gold left border on lesson rows */
  border-left: 3px solid var(--color-gold);
  display: flex; flex-direction: column; gap: 0.3rem;
}
.lesson-row:last-child { margin-bottom: 0; }
.lesson-time-tag {
  font-size: 0.7rem; color: var(--color-text-light);
  display: flex; align-items: center; gap: 0.3rem;
}
.lesson-info { display: flex; justify-content: space-between; align-items: center; }
.lesson-name { font-weight: 700; font-size: 0.83rem; color: var(--color-text-dark); }
.lesson-type-tag {
  font-size: 0.68rem; padding: 0.15rem 0.45rem; border-radius: 30px;
  background: #f1f5f9; color: var(--color-text-light);
}
.lesson-coach-tag { font-size: 0.72rem; color: var(--color-text-light); display: flex; align-items: center; gap: 0.3rem; }
.lesson-coach-tag i { color: var(--color-primary-light); font-size: 0.65rem; }

.date-placeholder {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.5rem; padding: 1.5rem; color: var(--color-text-light);
  font-size: 0.85rem; text-align: center;
  background: var(--color-gray-bg); border-radius: 12px;
  border: 1px dashed var(--color-gray-border);
}
.date-placeholder i { font-size: 1.4rem; color: #c1c8d0; }

/* ── Coaches Panel (full-width bottom) ────────────────── */
.coaches-panel { width: 100%; }
.coaches-panel-header { padding: 1.25rem 1.5rem; }

.add-coach-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  /* Gold CTA button */
  background: var(--color-gold); color: var(--color-navy);
  border: none; padding: 0.5rem 1.1rem; border-radius: 10px;
  font-weight: 700; font-size: 0.88rem; cursor: pointer;
  transition: all 0.15s;
}
.add-coach-btn:hover {
  background: var(--color-gold-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(244,196,0,.35);
}

.coaches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
}

.coach-card {
  background: var(--color-gray-bg);
  border: 1.5px solid var(--color-gray-border);
  border-radius: 16px; padding: 1.25rem;
  display: flex; flex-direction: column; gap: 1rem;
  cursor: pointer; transition: all 0.2s;
}
.coach-card:hover {
  border-color: var(--color-primary-light);
  box-shadow: 0 4px 16px rgba(3,105,161,.12);
  transform: translateY(-2px);
}
/* Active coach card: navy border + subtle navy tint */
.coach-card--active {
  border-color: var(--color-navy);
  background: rgba(12,59,94,.04);
  box-shadow: 0 4px 16px rgba(12,59,94,.12);
}

.coach-card-top { display: flex; align-items: center; gap: 0.8rem; }
.coach-ava {
  width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
  /* Navy-to-primary gradient for coach avatars */
  background: linear-gradient(135deg, var(--color-navy), var(--color-primary));
  color: var(--color-white);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1.2rem;
}
.coach-card-name { font-weight: 700; color: var(--color-text-dark); font-size: 0.95rem; display: block; }
.coach-card-type {
  font-size: 0.75rem; font-weight: 600;
  /* Gold pill for coach specialization */
  background: rgba(244,196,0,.14); color: #7a5f08;
  padding: 0.15rem 0.55rem; border-radius: 30px; display: inline-block; margin-top: 0.2rem;
}

.coach-card-details { display: flex; flex-direction: column; gap: 0.45rem; }
.coach-detail-item {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.8rem; color: var(--color-text-light);
}
.coach-detail-item i { color: var(--color-primary-light); font-size: 0.75rem; width: 14px; text-align: center; }

.coach-card-actions { display: flex; gap: 0.5rem; margin-top: auto; }
.cta-edit, .cta-delete {
  flex: 1; padding: 0.45rem; border-radius: 8px;
  font-size: 0.8rem; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 0.35rem;
  transition: all 0.15s; border: 1.5px solid;
}
.cta-edit   { background: rgba(3,105,161,.08); color: var(--color-primary); border-color: rgba(3,105,161,.22); }
.cta-edit:hover   { background: var(--color-primary); color: var(--color-white); border-color: var(--color-primary); }
.cta-delete { background: rgba(239,68,68,.08); color: #ef4444; border-color: rgba(239,68,68,.25); }
.cta-delete:hover { background: #ef4444; color: #fff; border-color: #ef4444; }

.coaches-empty { padding: 3rem; }

/* ── Modals ───────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(12,59,94,.55); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; animation: fadeIn 0.2s;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-box {
  background: var(--color-white); border-radius: 22px;
  width: 90%; max-width: 480px; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 24px 48px rgba(12,59,94,.18);
  animation: slideUp 0.25s ease;
}
.modal-box--wide { max-width: 560px; }
.modal-box--attendance {
  max-width: 1320px;
  width: 98vw;
  max-height: 96vh;
}
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.attendance-preview-body {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  overflow: hidden;
}

.attendance-preview-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  flex-wrap: wrap;
  font-size: 0.78rem;
}

.attendance-preview-wrap {
  max-height: none;
  overflow: hidden;
  border: 1px solid var(--color-gray-border);
  border-radius: 12px;
}

.attendance-preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.7rem;
}

.attendance-preview-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #f0f6fb;
  color: var(--color-text-light);
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.45px;
  padding: 0.35rem 0.42rem;
  text-align: left;
  border-bottom: 1px solid var(--color-gray-border);
}

.attendance-preview-table td {
  padding: 0.34rem 0.42rem;
  border-bottom: 1px solid #edf2f7;
  color: var(--color-text-dark);
  vertical-align: top;
}

.attendance-preview-table tbody tr:nth-child(even) {
  background: #fafcff;
}

.report-preview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.preview-card {
  border: 1px solid var(--color-gray-border);
  border-radius: 12px;
  overflow: hidden;
}

.preview-card h4 {
  margin: 0;
  padding: 0.45rem 0.58rem;
  font-size: 0.72rem;
  color: var(--color-text-dark);
  background: #f8fbff;
  border-bottom: 1px solid var(--color-gray-border);
}

@media (min-width: 1024px) {
  .modal-box--attendance .attendance-preview-body {
    zoom: 0.8;
  }
}

.modal-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.4rem 1.5rem;
  /* Navy accent top border on modal header */
  border-bottom: 2px solid var(--color-gold);
  background: linear-gradient(to right, rgba(12,59,94,.04), transparent);
}
.modal-head h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--color-text-dark); }
.close-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid var(--color-gray-border);
  background: var(--color-white); color: var(--color-text-light);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.close-btn:hover { background: #fef2f2; color: #ef4444; border-color: #fca5a5; }

.modal-body { padding: 1.5rem; }
.modal-foot {
  padding: 1.25rem 1.5rem; border-top: 1px solid var(--color-gray-border);
  display: flex; gap: 0.75rem; justify-content: flex-end;
}

.form-group { margin-bottom: 1.1rem; }
.form-group label {
  display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-light);
  margin-bottom: 0.45rem; text-transform: uppercase; letter-spacing: 0.4px;
}
.req { color: #ef4444; margin-left: 2px; }
.form-input {
  width: 100%; padding: 0.7rem 0.95rem;
  border: 1.5px solid var(--color-gray-border); border-radius: 10px;
  font-size: 0.92rem; color: var(--color-text-dark); transition: all 0.15s;
  box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(31,141,191,.12);
}

/* Primary = navy, secondary = outlined */
.btn-pri {
  background: var(--color-navy); color: var(--color-white); border: none;
  padding: 0.6rem 1.3rem; border-radius: 10px; font-weight: 600;
  font-size: 0.9rem; cursor: pointer; transition: all 0.15s;
}
.btn-pri:hover { background: var(--color-primary); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(3,105,161,.25); }
.btn-sec {
  background: var(--color-white); color: var(--color-text-light);
  border: 1.5px solid var(--color-gray-border);
  padding: 0.6rem 1.3rem; border-radius: 10px; font-weight: 600;
  font-size: 0.9rem; cursor: pointer; transition: all 0.15s;
}
.btn-sec:hover { border-color: var(--color-primary-light); color: var(--color-primary); }

/* Student detail modal */
.student-detail-header {
  display: flex; align-items: center; gap: 1rem;
  margin-bottom: 1.5rem; padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--color-gray-border);
}
.sd-name { font-size: 1.2rem; font-weight: 700; color: var(--color-text-dark); margin: 0 0 0.4rem; }

.detail-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;
}
.detail-item { display: flex; flex-direction: column; gap: 0.35rem; }
.detail-item--full { grid-column: span 2; }
.di-label { font-size: 0.72rem; font-weight: 700; color: var(--color-text-light); text-transform: uppercase; letter-spacing: 0.4px; }
.di-value { font-size: 0.95rem; font-weight: 500; color: var(--color-text-dark); }
.di-value.paid    { color: #16a34a; }
.di-value.pending { color: #92700a; }
/* Booking ref uses primary color */
.mono { font-family: monospace; font-size: 0.85rem; color: var(--color-primary); }

.schedule-block {
  display: flex; flex-direction: column; gap: 0.5rem;
  padding: 0.85rem; background: var(--color-gray-bg); border-radius: 10px;
  border-left: 3px solid var(--color-gold);
}
.sched-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; color: #475569; }
.sched-row i { color: var(--color-primary-light); width: 16px; }

/* ── Schedule Training Modal ─────────────────────────── */
.modal-box--schedule { max-width: 500px; }

.sched-modal-body {
  padding: 1.25rem 1.5rem;
  display: flex; flex-direction: column; gap: 0.85rem;
}
.sched-modal-student-name {
  font-weight: 400; color: var(--color-text-light); font-size: 0.88rem;
}

.sched-counter {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.6rem 1rem;
  background: rgba(3,105,161,.06); border-radius: 10px;
  border: 1px solid rgba(3,105,161,.15);
}
.sched-counter-label { font-size: 0.8rem; font-weight: 600; color: var(--color-text-light); display: flex; align-items: center; gap: 0.4rem; }
.sched-counter-value { font-size: 1rem; font-weight: 700; color: var(--color-primary); }
.sched-counter-max { color: var(--color-gold-dark) !important; }

.sched-cal {
  background: var(--color-gray-bg); border-radius: 12px;
  padding: 0.85rem 1rem; border: 1px solid var(--color-gray-border);
}
.sched-cal-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 0.6rem;
}

/* Selected day in schedule modal = primary blue */
.sched-day--selected {
  background: var(--color-primary) !important;
  color: var(--color-white) !important;
  border-color: var(--color-primary-dark) !important;
}
.sched-day--past {
  opacity: 0.3;
  cursor: not-allowed !important;
  pointer-events: none;
}
.sched-day--maxed {
  opacity: 0.45;
  cursor: not-allowed !important;
}

.sched-chips {
  display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0.5rem 0;
}
.sched-chip {
  display: inline-flex; align-items: center; gap: 0.3rem;
  background: rgba(3,105,161,.1); color: var(--color-primary);
  border: 1px solid rgba(3,105,161,.22);
  padding: 0.25rem 0.65rem; border-radius: 30px;
  font-size: 0.75rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.sched-chip:hover { background: rgba(239,68,68,.1); color: #ef4444; border-color: rgba(239,68,68,.3); }
.sched-chip i { font-size: 0.62rem; }

.sched-hint {
  font-size: 0.78rem; color: var(--color-text-light);
  text-align: center; padding: 0.4rem;
  border: 1px dashed var(--color-gray-border); border-radius: 8px;
}

/* ── Responsive ───────────────────────────────────────── */
@media (max-width: 1100px) {
  .top-row { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .calendar-panel .panel-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .students-filter-bar {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 640px) {
  .main-content { padding: 1rem; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .coaches-grid { grid-template-columns: 1fr; }
  .detail-grid { grid-template-columns: 1fr; }
  .detail-item--full { grid-column: span 1; }
  .row-actions { opacity: 1; }
  .students-filter-bar {
    grid-template-columns: 1fr;
  }
  .report-preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>