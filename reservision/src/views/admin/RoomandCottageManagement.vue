<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <AdminSidebar 
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      current-path="/admin/rooms"
      @close="sidebarOpen = false"
    />

    <!-- Main Content -->
    <main 
      class="main-content"
      :class="{ shifted: sidebarCollapsed }"
    >
      <!-- Header -->
      <div class="header-container">
        <AdminHeader 
          title="Room & Cottage Configuration"
          subtitle="Manage your resort rooms and cottages"
          @toggle-sidebar="sidebarOpen = !sidebarOpen"
        />
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-bed"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value" id="totalRooms">24</div>
            <div class="stat-label">Total Rooms</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value" id="availableRooms">18</div>
            <div class="stat-label">Available</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <i class="fas fa-door-open"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value" id="occupiedRooms">4</div>
            <div class="stat-label">Occupied</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon danger">
            <i class="fas fa-tools"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value" id="maintenanceRooms">2</div>
            <div class="stat-label">Maintenance</div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-container">
        <div class="filter-row">
          <input type="text" id="globalSearch" class="search-input" placeholder="Search rooms...">
          <select class="filter-select" id="typeFilter">
            <option value="all">All Types</option>
            <option>Standard Room</option>
            <option>Deluxe Room</option>
            <option>Cottage</option>
            <option>Suite</option>
          </select>
          <select class="filter-select" id="statusFilter">
            <option value="all">All Status</option>
            <option>Available</option>
            <option>Occupied</option>
            <option>Maintenance</option>
          </select>
        </div>
        <div class="action-buttons">
          <button class="btn btn-primary" id="addRoomBtn">
            <i class="fas fa-plus"></i> Add Room
          </button>
          <button class="btn btn-secondary" id="openAddPromo">
            <i class="fas fa-tag"></i> Add Promo
          </button>
          <button class="btn btn-outline" id="openSeasonalBtn">
            <i class="fas fa-calendar-day"></i> Seasonal
          </button>
        </div>
      </div>

      <!-- Room Cards Section -->
      <div class="rooms-section">
        <div class="section-header">
          <h3>Room Inventory</h3>
          <span class="room-count" id="roomCount">4 rooms</span>
        </div>
        <div class="room-grid" id="roomGrid"></div>
      </div>

      <!-- Promos Section -->
      <div class="promos-section">
        <div class="section-header">
          <h3>Promotions & Pricing</h3>
          <button class="btn btn-sm btn-secondary" id="addPromoBtn">
            <i class="fas fa-plus"></i> New
          </button>
        </div>
        <div class="promo-list" id="promoList"></div>
      </div>
    </main>
  </div>

  <!-- Modals -->
  <!-- Add/Edit Room Modal -->
  <div class="modal" id="roomModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="roomModalTitle">Add New Room</h3>
        <button class="close-modal" data-close="roomModal">×</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label for="roomName">Room Name</label>
            <input type="text" id="roomName" class="form-control" placeholder="e.g., Ocean View Suite">
          </div>
          <div class="form-group">
            <label for="roomType">Room Type</label>
            <select id="roomType" class="form-control">
              <option>Standard Room</option>
              <option>Deluxe Room</option>
              <option>Suite</option>
              <option>Cottage</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="roomCapacity">Capacity</label>
            <input type="number" id="roomCapacity" class="form-control" placeholder="Number of guests">
          </div>
          <div class="form-group">
            <label for="roomPrice">Price per Night ($)</label>
            <input type="number" id="roomPrice" class="form-control" placeholder="e.g., 199">
          </div>
        </div>

        <div class="form-group">
          <label for="roomDescription">Description</label>
          <textarea id="roomDescription" class="form-control" rows="3" placeholder="Describe the room features and amenities"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="roomStatus">Room Status</label>
            <select id="roomStatus" class="form-control">
              <option>Available</option>
              <option>Occupied</option>
              <option>Under Maintenance</option>
            </select>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="promoSwitch"> Mark as "Limited Offer"
            </label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" data-close="roomModal">Cancel</button>
        <button class="btn btn-primary" id="saveRoomBtn">Save Room</button>
      </div>
    </div>
  </div>

  <!-- Add/Edit Promo Modal -->
  <div class="modal" id="promoModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="promoModalTitle">Add New Promo</h3>
        <button class="close-modal" data-close="promoModal">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="promoCode">Promo Code</label>
          <input type="text" id="promoCode" class="form-control" placeholder="e.g., SUMMER25">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="promoType">Type</label>
            <select id="promoType" class="form-control">
              <option value="percent">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </div>
          <div class="form-group">
            <label for="promoValue">Value</label>
            <input type="number" id="promoValue" class="form-control" placeholder="e.g., 25">
          </div>
        </div>
        <div class="form-group">
          <label for="promoDesc">Description</label>
          <textarea id="promoDesc" class="form-control" rows="3" placeholder="Details about the promo"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="promoStart">Start Date</label>
            <input type="date" id="promoStart" class="form-control">
          </div>
          <div class="form-group">
            <label for="promoEnd">End Date</label>
            <input type="date" id="promoEnd" class="form-control">
          </div>
        </div>
        <div class="form-group">
          <label for="promoUsage">Usage Limit (optional)</label>
          <input type="number" id="promoUsage" class="form-control" placeholder="Total uses allowed">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" data-close="promoModal">Cancel</button>
        <button class="btn btn-primary" id="savePromoBtn">Save Promo</button>
      </div>
    </div>
  </div>

  <!-- Seasonal Pricing Modal -->
  <div class="modal" id="seasonalModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Seasonal Pricing Setup</h3>
        <button class="close-modal" data-close="seasonalModal">×</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label for="seasonName">Season Name</label>
            <input type="text" id="seasonName" class="form-control" placeholder="e.g., Peak Season">
          </div>
          <div class="form-group">
            <label for="seasonMultiplier">Price Multiplier</label>
            <input type="number" id="seasonMultiplier" class="form-control" step="0.1" value="1.2" placeholder="e.g., 1.2">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="seasonStart">Start Date</label>
            <input type="date" id="seasonStart" class="form-control">
          </div>
          <div class="form-group">
            <label for="seasonEnd">End Date</label>
            <input type="date" id="seasonEnd" class="form-control">
          </div>
        </div>
        <div class="form-group">
          <label for="applyToRooms">Apply to room types (comma-separated or 'all')</label>
          <input type="text" id="applyToRooms" class="form-control" placeholder="e.g., Suite,Cottage or all">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" data-close="seasonalModal">Cancel</button>
        <button class="btn btn-primary" id="saveSeasonBtn">Save Seasonal Pricing</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import AdminHeader from '../../components/admin/AdminHeader.vue'

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

// Modal helpers
const showModal = (id) => {
  const modal = document.getElementById(id)
  if (modal) modal.classList.add('show')
}

const hideModal = (id) => {
  const modal = document.getElementById(id)
  if (modal) modal.classList.remove('show')
}

// Utility functions
const qs = (sel, ctx = document) => ctx.querySelector(sel)
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel))

const escapeHtml = (text = '') => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return String(text).replace(/[&<>"']/g, (m) => map[m])
}

// Storage keys
const STORAGE_KEY_PROMOS = 'reservision_promos_v1'
const STORAGE_KEY_SEASONS = 'reservision_seasons_v1'

let promos = []
let editingPromoId = null
let editingRoomCard = null

// Load promos from localStorage
const loadPromos = () => {
  const raw = localStorage.getItem(STORAGE_KEY_PROMOS)
  try {
    promos = raw ? JSON.parse(raw) : []
  } catch {
    promos = []
  }
}

// Save promos to localStorage
const savePromos = () => {
  localStorage.setItem(STORAGE_KEY_PROMOS, JSON.stringify(promos))
}

// Render promos list
const renderPromos = (list = promos) => {
  const promoListEl = qs('#promoList')
  if (!promoListEl) return

  promoListEl.innerHTML = ''

  if (!list.length) {
    promoListEl.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>No promos found</p>
      </div>
    `
    return
  }

  list.forEach((p) => {
    const card = document.createElement('div')
    card.className = 'promo-card'
    card.innerHTML = `
      <div class="promo-content">
        <div>
          <div class="promo-title">${escapeHtml(p.code)}</div>
          <div class="promo-desc">${escapeHtml(p.description || '')}</div>
        </div>
        <div class="promo-value">${p.type === 'percent' ? p.value + '%' : '$' + p.value}</div>
      </div>
      <div class="promo-dates">
        <small>${p.start || '—'} to ${p.end || '—'}</small>
      </div>
      <div class="promo-actions">
        <button class="btn-action edit-promo" data-id="${p.id}" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-action delete-promo" data-id="${p.id}" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `
    promoListEl.appendChild(card)
  })

  // Attach event listeners
  qsa('.edit-promo').forEach((btn) =>
    btn.addEventListener('click', (e) => openPromoForEdit(e.currentTarget.dataset.id))
  )
  qsa('.delete-promo').forEach((btn) =>
    btn.addEventListener('click', (e) => {
      if (confirm('Delete this promo?')) {
        promos = promos.filter((x) => x.id !== e.currentTarget.dataset.id)
        savePromos()
        renderPromos()
      }
    })
  )
}

// Filter promos
const filterPromosBy = (query) => {
  if (!query) {
    renderPromos(promos)
    return
  }
  const filtered = promos.filter(
    (p) =>
      p.code.toLowerCase().includes(query) ||
      (p.description || '').toLowerCase().includes(query) ||
      (p.type || '').toLowerCase().includes(query)
  )
  renderPromos(filtered)
}

// Open promo for edit
const openPromoForEdit = (id) => {
  const p = promos.find((x) => x.id === id)
  if (!p) return

  editingPromoId = id
  qs('#promoModalTitle').textContent = 'Edit Promo'
  qs('#promoCode').value = p.code || ''
  qs('#promoType').value = p.type || 'percent'
  qs('#promoValue').value = p.value || ''
  qs('#promoDesc').value = p.description || ''
  qs('#promoStart').value = p.start || ''
  qs('#promoEnd').value = p.end || ''
  qs('#promoUsage').value = p.usageLimit || ''

  showModal('promoModal')
}

// Filter rooms
const filterRoomsBy = (query) => {
  const cards = qsa('.room-card')
  cards.forEach((c) => {
    const title = (c.getAttribute('data-title') || '').toLowerCase()
    const type = (c.getAttribute('data-type') || '').toLowerCase()
    const status = (c.getAttribute('data-status') || '').toLowerCase()
    const match = !query || title.includes(query) || type.includes(query) || status.includes(query)
    c.style.display = match ? '' : 'none'
  })
}

onMounted(() => {
  // Load initial data
  loadPromos()
  if (!promos.length) {
    promos = [
      {
        id: 'demo1',
        code: 'SUMMER25',
        type: 'percent',
        value: 25,
        description: 'Summer discount 25%'
      },
      {
        id: 'demo2',
        code: 'WELCOME50',
        type: 'fixed',
        value: 50,
        description: 'First-time guests $50 off',
        usageLimit: 100
      }
    ]
    savePromos()
  }
  renderPromos()

  // Modal event listeners
  qsa('.close-modal').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close')
      if (modalId) hideModal(modalId)
      else btn.closest('.modal').classList.remove('show')
    })
  })

  qsa('.modal').forEach((m) => {
    m.addEventListener('click', (e) => {
      if (e.target === m) m.classList.remove('show')
    })
  })

  // Search events
  const globalSearch = qs('#globalSearch')

  if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase()
      filterRoomsBy(q)
      filterPromosBy(q)
    })
  }

  // Room management
  const addRoomBtn = qs('#addRoomBtn')
  const roomGrid = qs('#roomGrid')
  const saveRoomBtn = qs('#saveRoomBtn')

  if (addRoomBtn) {
    addRoomBtn.addEventListener('click', () => {
      editingRoomCard = null
      qs('#roomModalTitle').textContent = 'Add New Room'
      qs('#roomName').value = ''
      qs('#roomType').value = 'Standard Room'
      qs('#roomCapacity').value = ''
      qs('#roomPrice').value = ''
      qs('#roomDescription').value = ''
      qs('#promoSwitch').checked = false
      qs('#roomStatus').value = 'Available'
      showModal('roomModal')
    })
  }

  // Edit room listeners
  qsa('.edit-room').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const card = e.currentTarget.closest('.room-card')
      editingRoomCard = card
      qs('#roomModalTitle').textContent = 'Edit Room'
      qs('#roomName').value = card.querySelector('.room-title').textContent.trim()
      qs('#roomType').value = card.getAttribute('data-type') || 'Standard Room'
      const price = (card.querySelector('.room-price')?.textContent || '').replace(/\D/g, '')
      qs('#roomPrice').value = price || ''
      qs('#roomDescription').value = card.querySelector('p')?.textContent || ''
      qs('#roomStatus').value = card.getAttribute('data-status') || 'Available'
      showModal('roomModal')
    })
  })

  // Delete room listeners
  qsa('.delete-room').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (confirm('Delete this room?')) {
        e.currentTarget.closest('.room-card').remove()
      }
    })
  })

  // Save room
  if (saveRoomBtn) {
    saveRoomBtn.addEventListener('click', () => {
      const name = qs('#roomName').value.trim()
      const type = qs('#roomType').value
      const price = qs('#roomPrice').value
      const desc = qs('#roomDescription').value
      const status = qs('#roomStatus').value
      const limited = qs('#promoSwitch').checked

      if (!name) return alert('Room name required')

      if (!editingRoomCard) {
        const card = document.createElement('div')
        card.className = 'room-card'
        card.setAttribute('data-title', name)
        card.setAttribute('data-type', type)
        card.setAttribute('data-status', status)
        card.innerHTML = `
          <div class="room-image" style="background-image:url('https://images.unsplash.com/photo-1505691723518-36a4f7b4fdf3?auto=format&fit=crop&w=600&q=80')">
            ${limited ? '<div class="room-promo">Limited Offer</div>' : ''}
          </div>
          <div class="room-details">
            <div class="room-header">
              <div>
                <div class="room-title">${escapeHtml(name)}</div>
                <div class="room-type">${escapeHtml(type)}</div>
              </div>
              <div class="room-price">$${escapeHtml(price)}<span>/night</span></div>
            </div>
            <p>${escapeHtml(desc)}</p>
            <div class="room-actions">
              <button class="btn btn-sm btn-outline edit-room">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="btn btn-sm btn-outline">
                <i class="fas fa-images"></i> Images
              </button>
              <button class="btn btn-sm btn-danger delete-room">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        `
        roomGrid.prepend(card)

        // Re-attach listeners to new card
        card.querySelector('.edit-room').addEventListener('click', (e) => {
          const c = e.currentTarget.closest('.room-card')
          editingRoomCard = c
          qs('#roomModalTitle').textContent = 'Edit Room'
          qs('#roomName').value = c.querySelector('.room-title').textContent.trim()
          qs('#roomType').value = c.getAttribute('data-type')
          const pr = (c.querySelector('.room-price')?.textContent || '').replace(/\D/g, '')
          qs('#roomPrice').value = pr || ''
          qs('#roomDescription').value = c.querySelector('p')?.textContent || ''
          qs('#roomStatus').value = c.getAttribute('data-status')
          showModal('roomModal')
        })

        card.querySelector('.delete-room').addEventListener('click', () => {
          if (confirm('Delete this room?')) card.remove()
        })
      } else {
        editingRoomCard.setAttribute('data-title', name)
        editingRoomCard.setAttribute('data-type', type)
        editingRoomCard.setAttribute('data-status', status)
        editingRoomCard.querySelector('.room-title').textContent = name
        editingRoomCard.querySelector('.room-type').textContent = type
        editingRoomCard.querySelector('.room-price').innerHTML = `$${escapeHtml(price)}<span>/night</span>`
        editingRoomCard.querySelector('p').textContent = desc

        const badge = editingRoomCard.querySelector('.room-promo')
        if (limited && !badge) {
          editingRoomCard.querySelector('.room-image').insertAdjacentHTML(
            'beforeend',
            '<div class="room-promo">Limited Offer</div>'
          )
        } else if (!limited && badge) {
          badge.remove()
        }
      }

      hideModal('roomModal')
    })
  }

  // Promo management
  const savePromoBtn = qs('#savePromoBtn')
  const openAddPromoBtn = qs('#openAddPromo')

  if (openAddPromoBtn) {
    openAddPromoBtn.addEventListener('click', () => {
      editingPromoId = null
      qs('#promoModalTitle').textContent = 'Add New Promo'
      qs('#promoCode').value = ''
      qs('#promoType').value = 'percent'
      qs('#promoValue').value = ''
      qs('#promoDesc').value = ''
      qs('#promoStart').value = ''
      qs('#promoEnd').value = ''
      qs('#promoUsage').value = ''
      showModal('promoModal')
    })
  }

  if (savePromoBtn) {
    savePromoBtn.addEventListener('click', () => {
      const code = qs('#promoCode').value.trim()
      const type = qs('#promoType').value
      const value = Number(qs('#promoValue').value)

      if (!code) return alert('Promo code required')
      if (!value || value <= 0) return alert('Enter a valid promo value')

      const obj = {
        id: editingPromoId || 'promo_' + Date.now(),
        code,
        type,
        value,
        description: qs('#promoDesc').value.trim(),
        start: qs('#promoStart').value || null,
        end: qs('#promoEnd').value || null,
        usageLimit: qs('#promoUsage').value ? Number(qs('#promoUsage').value) : null
      }

      if (editingPromoId) {
        promos = promos.map((p) => (p.id === editingPromoId ? obj : p))
      } else {
        promos.unshift(obj)
      }

      savePromos()
      renderPromos()
      hideModal('promoModal')
    })
  }

  // Seasonal pricing
  const openSeasonalBtn = qs('#openSeasonalBtn')
  const saveSeasonBtn = qs('#saveSeasonBtn')

  if (openSeasonalBtn) {
    openSeasonalBtn.addEventListener('click', () => {
      qs('#seasonName').value = ''
      qs('#seasonMultiplier').value = '1.2'
      qs('#seasonStart').value = ''
      qs('#seasonEnd').value = ''
      qs('#applyToRooms').value = 'all'
      showModal('seasonalModal')
    })
  }

  if (saveSeasonBtn) {
    saveSeasonBtn.addEventListener('click', () => {
      const name = qs('#seasonName').value.trim()
      const mult = Number(qs('#seasonMultiplier').value)

      if (!name) return alert('Season name required')
      if (!mult || mult <= 0) return alert('Multiplier must be > 0')

      const all = JSON.parse(localStorage.getItem(STORAGE_KEY_SEASONS) || '[]')
      all.push({
        id: 'season_' + Date.now(),
        name,
        multiplier: mult,
        start: qs('#seasonStart').value,
        end: qs('#seasonEnd').value,
        applyTo: qs('#applyToRooms').value.trim() || 'all'
      })

      localStorage.setItem(STORAGE_KEY_SEASONS, JSON.stringify(all))
      alert('Season saved locally')
      hideModal('seasonalModal')
    })
  }
})
</script>

<style scoped>
@import '../../assets/admin-styles.css';

/* Room & Cottage Management Specific Styles */
.header-container {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(43, 108, 176, 0.08);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #2b6cb0, transparent);
  opacity: 0;
  transition: opacity 0.35s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: rgba(43, 108, 176, 0.15);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: rgba(43, 108, 176, 0.12);
  color: #2b6cb0;
  transition: all 0.35s ease;
  flex-shrink: 0;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
  background: rgba(43, 108, 176, 0.18);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.filters-container {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafb 100%);
  border-radius: 1rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(43, 108, 176, 0.08);
  transition: all 0.3s ease;
}

.filter-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
}

.search-input:focus {
  outline: none;
  border-color: #2b6cb0;
  box-shadow: 0 0 0 4px rgba(43, 108, 176, 0.12), inset 0 1px 2px rgba(0, 0, 0, 0.04);
  background: white;
}

.filter-select {
  padding: 0.75rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.625rem;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
}

.filter-select:focus {
  outline: none;
  border-color: #2b6cb0;
  box-shadow: 0 0 0 4px rgba(43, 108, 176, 0.12), inset 0 1px 2px rgba(0, 0, 0, 0.04);
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 0.625rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.btn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #2b6cb0 0%, #1e40af 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  box-shadow: 0 6px 20px rgba(30, 64, 175, 0.3);
}

.btn-secondary {
  background: linear-gradient(135deg, #c2a68c 0%, #a68768 100%);
  color: white;
  font-weight: 600;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #a68768 0%, #8b6f4e 100%);
  box-shadow: 0 6px 20px rgba(165, 135, 104, 0.3);
}

.btn-outline {
  background: transparent;
  border: 1.5px solid #d1d5db;
  color: #6b7280;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #2b6cb0;
  color: #2b6cb0;
  box-shadow: 0 2px 8px rgba(43, 108, 176, 0.1);
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.3);
}

.rooms-section {
  margin-bottom: 2rem;
}

.promos-section {
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.02em;
}

.room-count {
  font-size: 0.75rem;
  font-weight: 700;
  color: #2b6cb0;
  background: linear-gradient(135deg, rgba(43, 108, 176, 0.1), rgba(43, 108, 176, 0.05));
  padding: 0.375rem 0.875rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(43, 108, 176, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.75rem;
}

.room-card {
  background: white;
  border-radius: 0.875rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.04);
  position: relative;
}

.room-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(43, 108, 176, 0), rgba(43, 108, 176, 0));
  pointer-events: none;
  border-radius: 0.875rem;
  transition: all 0.35s ease;
}

.room-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  border-color: rgba(43, 108, 176, 0.1);
}

.room-image {
  width: 100%;
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.room-card:hover .room-image {
  transform: scale(1.08);
}

.room-promo {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.room-details {
  padding: 1.25rem;
  position: relative;
  z-index: 1;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.room-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2b6cb0;
  letter-spacing: -0.01em;
}

.room-type {
  font-size: 0.8125rem;
  color: #9ca3af;
  margin-top: 0.375rem;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.room-price {
  font-size: 1.25rem;
  font-weight: 800;
  color: #2b6cb0;
  text-align: right;
  letter-spacing: -0.01em;
}

.room-price span {
  font-size: 0.75rem;
  font-weight: 400;
  color: #6b7280;
  display: block;
}

.room-details > p {
  font-size: 0.8125rem;
  color: #9ca3af;
  margin: 0.75rem 0 1rem 0;
  line-height: 1.6;
}

.room-actions {
  display: flex;
  gap: 0.625rem;
  margin-top: 1rem;
  padding-top: 0.875rem;
  border-top: 1px solid #f3f4f6;
}

.promo-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.promo-card {
  background: white;
  border: 1px solid rgba(194, 166, 140, 0.15);
  border-radius: 0.875rem;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.promo-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #c2a68c, transparent);
  opacity: 0;
  transition: opacity 0.35s ease;
}

.promo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(194, 166, 140, 0.15);
  border-color: rgba(194, 166, 140, 0.3);
}

.promo-card:hover::before {
  opacity: 1;
}

.promo-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.promo-title {
  font-weight: 800;
  color: #2b6cb0;
  margin-bottom: 0.375rem;
  font-size: 0.9875rem;
  letter-spacing: -0.005em;
}

.promo-desc {
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.5;
}

.promo-value {
  background: linear-gradient(135deg, #c2a68c 0%, #a68768 100%);
  color: white;
  padding: 0.625rem 1.125rem;
  border-radius: 0.625rem;
  font-weight: 700;
  font-size: 0.9375rem;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(194, 166, 140, 0.2);
  transition: all 0.3s ease;
}

.promo-card:hover .promo-value {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(194, 166, 140, 0.3);
}

.promo-dates {
  font-size: 0.75rem;
  color: #d1d5db;
  margin-bottom: 1rem;
  font-weight: 500;
  letter-spacing: 0.03em;
}

.promo-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.btn-action {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.625rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f3f4f6;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 600;
}

.btn-action:hover {
  background: #2b6cb0;
  color: white;
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.3);
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #9ca3af;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.4;
  display: block;
}

.empty-state p {
  margin: 0.75rem 0 0 0;
  font-size: 0.9375rem;
  line-height: 1.6;
}

/* Modals */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: hidden;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 999;
  backdrop-filter: blur(2px);
}

.modal.show {
  visibility: visible;
  opacity: 1;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.05);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #2b6cb0 0%, #1e40af 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.close-modal {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
  transition: all 0.2s ease;
  border-radius: 0.5rem;
}

.close-modal:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.625rem;
  font-weight: 700;
  color: #111827;
  font-size: 0.9375rem;
  letter-spacing: -0.005em;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
}

.form-control:focus {
  outline: none;
  border-color: #2b6cb0;
  box-shadow: 0 0 0 4px rgba(43, 108, 176, 0.12), inset 0 1px 2px rgba(0, 0, 0, 0.04);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-card {
    padding: 1.25rem 1rem;
  }

  .stat-icon {
    width: 3rem;
    height: 3rem;
    font-size: 1.25rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .filter-row {
    flex-direction: column;
  }

  .search-input,
  .filter-select {
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .btn {
    width: 100%;
    justify-content: center;
  }

  .room-grid {
    grid-template-columns: 1fr;
  }

  .promo-list {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .room-count {
    margin-top: 0.5rem;
  }

  .modal-content {
    width: 95%;
    max-width: none;
  }

  .modal-body {
    padding: 1.25rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.8125rem;
  }

  .section-header h3 {
    font-size: 1.125rem;
  }

  .room-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .promo-list {
    grid-template-columns: 1fr;
    gap: 0.875rem;
  }

  .promo-card {
    padding: 1rem;
  }

  .promo-title {
    font-size: 0.9375rem;
  }

  .promo-value {
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
  }

  .btn {
    padding: 0.625rem 1rem;
    font-size: 0.8125rem;
  }

  .btn-sm {
    padding: 0.5rem 0.625rem;
    font-size: 0.75rem;
  }

  .room-actions {
    flex-direction: column;
    gap: 0.375rem;
  }

  .room-actions .btn {
    width: 100%;
    justify-content: center;
  }
}

  .modal-content {
    width: 95%;
  }

</style>
