<template>
  <div class="admin-layout">
    <AdminSidebar
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      current-path="/admin/rooms"
      @close="sidebarOpen = false"
    />

    <main class="main-content" :class="{ shifted: sidebarCollapsed }">

      <AdminHeader
        title="Room & Cottage Configuration"
        subtitle="Manage your resort rooms and cottages"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <div class="content-container">

        <!-- ── Stats Grid ── -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon si-blue"><i class="fas fa-bed"></i></div>
            <div class="stat-content">
              <div class="stat-value sv-blue" id="totalRooms">24</div>
              <div class="stat-label">Total Rooms</div>
            </div>
            <div class="stat-wm"><i class="fas fa-bed"></i></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon si-green"><i class="fas fa-check-circle"></i></div>
            <div class="stat-content">
              <div class="stat-value sv-green" id="availableRooms">18</div>
              <div class="stat-label">Available</div>
            </div>
            <div class="stat-wm"><i class="fas fa-check-circle"></i></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon si-orange"><i class="fas fa-door-open"></i></div>
            <div class="stat-content">
              <div class="stat-value sv-orange" id="occupiedRooms">4</div>
              <div class="stat-label">Occupied</div>
            </div>
            <div class="stat-wm"><i class="fas fa-door-open"></i></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon si-red"><i class="fas fa-tools"></i></div>
            <div class="stat-content">
              <div class="stat-value sv-red" id="maintenanceRooms">2</div>
              <div class="stat-label">Maintenance</div>
            </div>
            <div class="stat-wm"><i class="fas fa-tools"></i></div>
          </div>
        </div>

        <!-- ── Rooms Section ── -->
        <div class="section-card">

          <!-- Section header -->
          <div class="section-header">
            <div class="section-header-left">
              <h2 class="section-title">Room Inventory</h2>
              <p class="section-subtitle">Browse and manage all room configurations</p>
            </div>
            <div class="header-actions">
              <button class="btn-outline" id="openSeasonalBtn">
                <i class="fas fa-calendar-day"></i>
                <span>Seasonal</span>
              </button>
              <button class="btn-secondary" id="openAddPromo">
                <i class="fas fa-tag"></i>
                <span>Add Promo</span>
              </button>
              <button class="btn-primary" id="addRoomBtn">
                <i class="fas fa-plus"></i>
                <span>Add Room</span>
              </button>
            </div>
          </div>

          <!-- Controls bar -->
          <div class="controls-bar">
            <div class="search-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input
                type="text"
                id="globalSearch"
                class="search-input"
                placeholder="Search rooms and promos…"
              />
            </div>
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

          <!-- Summary pill -->
          <div class="rooms-summary">
            <i class="fas fa-bed summary-icon"></i>
            <span id="roomCount">Showing 4 room(s)</span>
          </div>

          <!-- Rooms grid -->
          <div class="room-grid" id="roomGrid"></div>

        </div>

        <!-- ── Promos Section ── -->
        <div class="section-card">

          <div class="section-header">
            <div class="section-header-left">
              <h2 class="section-title">Promotions & Pricing</h2>
              <p class="section-subtitle">Create and manage promotional offers</p>
            </div>
            <button class="btn-primary" id="addPromoBtn">
              <i class="fas fa-plus"></i>
              <span>New Promo</span>
            </button>
          </div>

          <div class="promo-list" id="promoList"></div>

        </div>

      </div>
    </main>

    <!-- ══ ROOM MODAL ══ -->
    <div class="modal" id="roomModal">
      <div class="modal-box">
        <div class="modal-head">
          <div class="modal-head-left">
            <div class="modal-head-icon"><i class="fas fa-bed"></i></div>
            <div>
              <h3 class="modal-title" id="roomModalTitle">Add New Room</h3>
              <p class="modal-sub">Fill in the room details below</p>
            </div>
          </div>
          <button class="modal-close-btn" data-close="roomModal"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Room Name <span class="req">*</span></label>
              <input type="text" id="roomName" class="form-input" placeholder="e.g., Ocean View Suite" />
            </div>
            <div class="form-group">
              <label class="form-label">Room Type <span class="req">*</span></label>
              <select id="roomType" class="form-input">
                <option>Standard Room</option>
                <option>Deluxe Room</option>
                <option>Suite</option>
                <option>Cottage</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Capacity</label>
              <input type="number" id="roomCapacity" class="form-input" placeholder="Number of guests" />
            </div>
            <div class="form-group">
              <label class="form-label">Price per Night (₱)</label>
              <input type="number" id="roomPrice" class="form-input" placeholder="e.g., 4500" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea id="roomDescription" class="form-input" rows="3" placeholder="Describe the room features and amenities"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Room Status</label>
              <select id="roomStatus" class="form-input">
                <option>Available</option>
                <option>Occupied</option>
                <option>Under Maintenance</option>
              </select>
            </div>
            <div class="form-group form-checkbox-row">
              <input type="checkbox" id="promoSwitch" class="form-checkbox" />
              <label for="promoSwitch" class="form-label checkbox-label">Mark as "Limited Offer"</label>
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn-cancel" data-close="roomModal">Cancel</button>
          <button class="btn-primary" id="saveRoomBtn"><i class="fas fa-save"></i> Save Room</button>
        </div>
      </div>
    </div>

    <!-- ══ PROMO MODAL ══ -->
    <div class="modal" id="promoModal">
      <div class="modal-box">
        <div class="modal-head">
          <div class="modal-head-left">
            <div class="modal-head-icon modal-head-icon--gold"><i class="fas fa-tag"></i></div>
            <div>
              <h3 class="modal-title" id="promoModalTitle">Add New Promo</h3>
              <p class="modal-sub">Set up a promotional offer</p>
            </div>
          </div>
          <button class="modal-close-btn" data-close="promoModal"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Promo Code <span class="req">*</span></label>
            <input type="text" id="promoCode" class="form-input" placeholder="e.g., SUMMER25" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Type</label>
              <select id="promoType" class="form-input">
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Value <span class="req">*</span></label>
              <input type="number" id="promoValue" class="form-input" placeholder="e.g., 25" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea id="promoDesc" class="form-input" rows="3" placeholder="Details about the promo"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Start Date</label>
              <input type="date" id="promoStart" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">End Date</label>
              <input type="date" id="promoEnd" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Usage Limit <span class="form-hint">(optional)</span></label>
            <input type="number" id="promoUsage" class="form-input" placeholder="Total uses allowed" />
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn-cancel" data-close="promoModal">Cancel</button>
          <button class="btn-primary btn-gold" id="savePromoBtn"><i class="fas fa-save"></i> Save Promo</button>
        </div>
      </div>
    </div>

    <!-- ══ SEASONAL MODAL ══ -->
    <div class="modal" id="seasonalModal">
      <div class="modal-box">
        <div class="modal-head">
          <div class="modal-head-left">
            <div class="modal-head-icon"><i class="fas fa-calendar-day"></i></div>
            <div>
              <h3 class="modal-title">Seasonal Pricing Setup</h3>
              <p class="modal-sub">Configure rate multipliers by season</p>
            </div>
          </div>
          <button class="modal-close-btn" data-close="seasonalModal"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Season Name <span class="req">*</span></label>
              <input type="text" id="seasonName" class="form-input" placeholder="e.g., Peak Season" />
            </div>
            <div class="form-group">
              <label class="form-label">Price Multiplier</label>
              <input type="number" id="seasonMultiplier" class="form-input" step="0.1" value="1.2" placeholder="e.g., 1.2" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Start Date</label>
              <input type="date" id="seasonStart" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">End Date</label>
              <input type="date" id="seasonEnd" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Apply to Room Types <span class="form-hint">(comma-separated or "all")</span></label>
            <input type="text" id="applyToRooms" class="form-input" placeholder="e.g., Suite,Cottage or all" />
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn-cancel" data-close="seasonalModal">Cancel</button>
          <button class="btn-primary" id="saveSeasonBtn"><i class="fas fa-save"></i> Save Pricing</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import AdminHeader  from '../../components/admin/AdminHeader.vue'

const sidebarOpen      = ref(false)
const sidebarCollapsed = ref(false)

const showModal = (id) => { const m = document.getElementById(id); if (m) m.classList.add('show') }
const hideModal = (id) => { const m = document.getElementById(id); if (m) m.classList.remove('show') }

const qs  = (sel, ctx = document) => ctx.querySelector(sel)
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel))

const escapeHtml = (text = '') => {
  const map = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }
  return String(text).replace(/[&<>"']/g, m => map[m])
}

const STORAGE_KEY_PROMOS  = 'reservision_promos_v1'
const STORAGE_KEY_SEASONS = 'reservision_seasons_v1'

let promos = []
let editingPromoId  = null
let editingRoomCard = null

const loadPromos = () => {
  try { promos = JSON.parse(localStorage.getItem(STORAGE_KEY_PROMOS) || '[]') }
  catch { promos = [] }
}
const savePromos = () => localStorage.setItem(STORAGE_KEY_PROMOS, JSON.stringify(promos))

const renderPromos = (list = promos) => {
  const el = qs('#promoList')
  if (!el) return
  el.innerHTML = ''

  if (!list.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-wrap"><i class="fas fa-gift"></i></div>
        <p class="empty-title">No promos yet</p>
        <p class="empty-sub">Create a promo to start offering deals to guests.</p>
      </div>`
    return
  }

  list.forEach(p => {
    const card = document.createElement('div')
    card.className = 'promo-card'
    card.innerHTML = `
      <div class="pc-header">
        <span class="pc-code">${escapeHtml(p.code)}</span>
        <span class="pc-value">${p.type === 'percent' ? p.value + '%' : '₱' + p.value} off</span>
      </div>
      <div class="pc-body">
        <p class="pc-desc">${escapeHtml(p.description || '')}</p>
        <div class="pc-dates"><i class="fas fa-calendar-alt"></i> ${p.start || '—'} → ${p.end || '—'}</div>
      </div>
      <div class="pc-foot">
        <button class="act-btn ebtn edit-promo" data-id="${p.id}" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="act-btn dbtn delete-promo" data-id="${p.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </div>`
    el.appendChild(card)
  })

  qsa('.edit-promo').forEach(btn => btn.addEventListener('click', e => openPromoForEdit(e.currentTarget.dataset.id)))
  qsa('.delete-promo').forEach(btn => btn.addEventListener('click', e => {
    if (confirm('Delete this promo?')) {
      promos = promos.filter(x => x.id !== e.currentTarget.dataset.id)
      savePromos(); renderPromos()
    }
  }))
}

const filterPromosBy = q => {
  if (!q) { renderPromos(promos); return }
  renderPromos(promos.filter(p =>
    p.code.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
  ))
}

const openPromoForEdit = id => {
  const p = promos.find(x => x.id === id)
  if (!p) return
  editingPromoId = id
  qs('#promoModalTitle').textContent = 'Edit Promo'
  qs('#promoCode').value  = p.code  || ''
  qs('#promoType').value  = p.type  || 'percent'
  qs('#promoValue').value = p.value || ''
  qs('#promoDesc').value  = p.description || ''
  qs('#promoStart').value = p.start || ''
  qs('#promoEnd').value   = p.end   || ''
  qs('#promoUsage').value = p.usageLimit || ''
  showModal('promoModal')
}

const filterRoomsBy = q => {
  qsa('.room-card').forEach(c => {
    const match = !q ||
      (c.getAttribute('data-title') || '').toLowerCase().includes(q) ||
      (c.getAttribute('data-type')  || '').toLowerCase().includes(q) ||
      (c.getAttribute('data-status')|| '').toLowerCase().includes(q)
    c.style.display = match ? '' : 'none'
  })
}

onMounted(() => {
  loadPromos()
  if (!promos.length) {
    promos = [
      { id:'demo1', code:'SUMMER25',  type:'percent', value:25, description:'Summer season 25% discount for all rooms.' },
      { id:'demo2', code:'WELCOME50', type:'fixed',   value:50, description:'First-time guests ₱50 off their booking.', usageLimit:100 },
      { id:'demo3', code:'EARLY15',   type:'percent', value:15, description:'Early bird promo — book 30 days in advance.' }
    ]
    savePromos()
  }
  renderPromos()

  // Close modal listeners
  qsa('.close-modal, [data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-close')
      if (id) hideModal(id)
      else btn.closest('.modal')?.classList.remove('show')
    })
  })
  qsa('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('show') }))

  // Search
  qs('#globalSearch')?.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase()
    filterRoomsBy(q); filterPromosBy(q)
  })

  // Add Room
  const roomGrid   = qs('#roomGrid')
  const saveRoomBtn = qs('#saveRoomBtn')

  qs('#addRoomBtn')?.addEventListener('click', () => {
    editingRoomCard = null
    qs('#roomModalTitle').textContent = 'Add New Room'
    qs('#roomName').value = ''; qs('#roomType').value = 'Standard Room'
    qs('#roomCapacity').value = ''; qs('#roomPrice').value = ''
    qs('#roomDescription').value = ''; qs('#promoSwitch').checked = false
    qs('#roomStatus').value = 'Available'
    showModal('roomModal')
  })

  saveRoomBtn?.addEventListener('click', () => {
    const name   = qs('#roomName').value.trim()
    const type   = qs('#roomType').value
    const price  = qs('#roomPrice').value
    const desc   = qs('#roomDescription').value
    const status = qs('#roomStatus').value
    const limited = qs('#promoSwitch').checked
    if (!name) return alert('Room name required')

    const statusClass = status === 'Available' ? 's-a' : status === 'Occupied' ? 's-o' : 's-m'

    if (!editingRoomCard) {
      const card = document.createElement('div')
      card.className = 'room-card'
      card.setAttribute('data-title', name)
      card.setAttribute('data-type',  type)
      card.setAttribute('data-status',status)
      card.innerHTML = `
        <div class="rc-header">
          <div>
            <div class="rc-name">${escapeHtml(name)}</div>
            <div class="rc-type">${escapeHtml(type)}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px">
            <div class="rc-price">₱${escapeHtml(price)}<span>/night</span></div>
            ${limited ? '<span class="rc-badge-promo">Limited Offer</span>' : ''}
          </div>
        </div>
        <div class="rc-body">
          <span class="rc-status ${statusClass}">${escapeHtml(status)}</span>
          <p class="rc-desc">${escapeHtml(desc)}</p>
        </div>
        <div class="rc-foot">
          <button class="act-btn ebtn edit-room"><i class="fas fa-edit"></i></button>
          <button class="act-btn dbtn delete-room"><i class="fas fa-trash"></i></button>
        </div>`

      card.querySelector('.edit-room').addEventListener('click', () => openRoomForEdit(card))
      card.querySelector('.delete-room').addEventListener('click', () => { if (confirm('Delete this room?')) card.remove() })
      roomGrid.prepend(card)
    } else {
      editingRoomCard.setAttribute('data-title', name)
      editingRoomCard.setAttribute('data-type',  type)
      editingRoomCard.setAttribute('data-status',status)
      editingRoomCard.querySelector('.rc-name').textContent = name
      editingRoomCard.querySelector('.rc-type').textContent = type
      editingRoomCard.querySelector('.rc-price').innerHTML  = `₱${escapeHtml(price)}<span>/night</span>`
      editingRoomCard.querySelector('.rc-desc').textContent = desc
      const s = editingRoomCard.querySelector('.rc-status')
      if (s) { s.textContent = status; s.className = `rc-status ${status === 'Available' ? 's-a' : status === 'Occupied' ? 's-o' : 's-m'}` }
    }

    hideModal('roomModal')
  })

  const openRoomForEdit = card => {
    editingRoomCard = card
    qs('#roomModalTitle').textContent = 'Edit Room'
    qs('#roomName').value   = card.querySelector('.rc-name')?.textContent || ''
    qs('#roomType').value   = card.getAttribute('data-type')  || 'Standard Room'
    qs('#roomStatus').value = card.getAttribute('data-status')|| 'Available'
    qs('#roomPrice').value  = (card.querySelector('.rc-price')?.textContent || '').replace(/[^\d]/g, '')
    qs('#roomDescription').value = card.querySelector('.rc-desc')?.textContent || ''
    showModal('roomModal')
  }

  // Promo modal
  qs('#openAddPromo')?.addEventListener('click', () => {
    editingPromoId = null
    qs('#promoModalTitle').textContent = 'Add New Promo'
    ;['promoCode','promoValue','promoDesc','promoStart','promoEnd','promoUsage'].forEach(id => { qs('#'+id).value = '' })
    qs('#promoType').value = 'percent'
    showModal('promoModal')
  })
  qs('#addPromoBtn')?.addEventListener('click', () => qs('#openAddPromo').click())

  qs('#savePromoBtn')?.addEventListener('click', () => {
    const code  = qs('#promoCode').value.trim()
    const value = Number(qs('#promoValue').value)
    if (!code)              return alert('Promo code required')
    if (!value || value<=0) return alert('Enter a valid promo value')

    const obj = {
      id: editingPromoId || 'promo_' + Date.now(),
      code, type: qs('#promoType').value, value,
      description: qs('#promoDesc').value.trim(),
      start: qs('#promoStart').value || null,
      end:   qs('#promoEnd').value   || null,
      usageLimit: qs('#promoUsage').value ? Number(qs('#promoUsage').value) : null
    }

    promos = editingPromoId ? promos.map(p => p.id === editingPromoId ? obj : p) : [obj, ...promos]
    savePromos(); renderPromos(); hideModal('promoModal')
  })

  // Seasonal modal
  qs('#openSeasonalBtn')?.addEventListener('click', () => {
    qs('#seasonName').value = ''; qs('#seasonMultiplier').value = '1.2'
    qs('#seasonStart').value = ''; qs('#seasonEnd').value = ''; qs('#applyToRooms').value = 'all'
    showModal('seasonalModal')
  })

  qs('#saveSeasonBtn')?.addEventListener('click', () => {
    const name = qs('#seasonName').value.trim()
    const mult = Number(qs('#seasonMultiplier').value)
    if (!name)        return alert('Season name required')
    if (!mult||mult<=0) return alert('Multiplier must be > 0')

    const all = JSON.parse(localStorage.getItem(STORAGE_KEY_SEASONS) || '[]')
    all.push({ id:'season_'+Date.now(), name, multiplier:mult,
      start: qs('#seasonStart').value, end: qs('#seasonEnd').value,
      applyTo: qs('#applyToRooms').value.trim() || 'all' })
    localStorage.setItem(STORAGE_KEY_SEASONS, JSON.stringify(all))
    alert('Season saved'); hideModal('seasonalModal')
  })
})
</script>

<style scoped>
/* ── Eduardo's Resort Color Palette ── */
.admin-layout {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-gray-bg:       #EEF5FB;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

/* ── Keyframes ── */
@keyframes fadeUp  { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
@keyframes slideUp { from { opacity:0; transform:translateY(18px)} to { opacity:1; transform:translateY(0) } }
@keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }

/* ── Layout ── */
.admin-layout {
  min-height: 100vh;
  background: var(--color-gray-bg);
  font-family: 'Segoe UI', system-ui, sans-serif;
}
.main-content {
  margin-left: 0;
  padding-top: 64px;
  transition: margin-left 0.3s ease;
}
.main-content.shifted { margin-left: 72px; }
@media (min-width: 768px) { .main-content { margin-left: 262px; } }

.content-container {
  padding: 1.5rem 1.75rem;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
@media (max-width: 768px) { .content-container { padding: 0.85rem; gap: 1rem; } }

/* ── Stats Grid ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  animation: fadeUp .3s ease both;
}
@media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px)  { .stats-grid { grid-template-columns: 1fr 1fr; gap: .75rem; } }

.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.4rem;
  background: var(--color-white);
  border-radius: 16px;
  border: 0.5px solid var(--color-gray-border);
  box-shadow: 0 2px 10px rgba(3,105,161,.07);
  overflow: hidden;
  transition: transform .22s ease, box-shadow .22s ease;
}
.stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(3,105,161,.14); }
.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 16px 16px 0 0;
}
.stat-card:nth-child(1)::before { background: var(--color-primary-light); }
.stat-card:nth-child(2)::before { background: #16a34a; }
.stat-card:nth-child(3)::before { background: #ea580c; }
.stat-card:nth-child(4)::before { background: #dc2626; }

.stat-icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; flex-shrink: 0;
  transition: transform .22s ease;
}
.stat-card:hover .stat-icon { transform: scale(1.1) rotate(-4deg); }
.si-blue   { background: rgba(31,141,191,.12); color: var(--color-primary-light); }
.si-green  { background: rgba(22,163,74,.12);  color: #16a34a; }
.si-orange { background: rgba(234,88,12,.1);   color: #ea580c; }
.si-red    { background: rgba(220,38,38,.1);   color: #dc2626; }

.stat-content { flex: 1; min-width: 0; position: relative; z-index: 1; }
.stat-value { font-size: 1.85rem; font-weight: 800; line-height: 1; }
.sv-blue   { color: var(--color-primary-light); }
.sv-green  { color: #16a34a; }
.sv-orange { color: #ea580c; }
.sv-red    { color: #dc2626; }
.stat-label {
  font-size: .7rem; color: var(--color-text-light);
  margin-top: .3rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .6px;
}
.stat-wm {
  position: absolute; right: -10px; bottom: -10px;
  font-size: 4rem; opacity: .04; pointer-events: none;
  transition: opacity .22s;
}
.stat-card:hover .stat-wm { opacity: .08; }

/* ── Section Card ── */
.section-card {
  background: var(--color-white);
  border-radius: 20px;
  padding: 1.5rem 1.75rem;
  border: 0.5px solid var(--color-gray-border);
  box-shadow: 0 2px 16px rgba(3,105,161,.07);
  animation: fadeUp .3s .1s ease both;
}
@media (max-width: 768px) { .section-card { padding: 1rem; border-radius: 14px; } }

/* ── Section Header ── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: .75rem;
  padding-bottom: 1rem;
  margin-bottom: 1.25rem;
  border-bottom: 2px solid rgba(244,196,0,.3);
}
.section-header-left { flex: 1; min-width: 0; }
.section-title {
  font-size: 1.15rem; font-weight: 800; color: var(--color-navy);
  margin: 0 0 .2rem;
  display: flex; align-items: center; gap: .65rem;
}
.section-title::before {
  content: '';
  display: inline-block;
  width: 4px; height: 1.1em;
  background: var(--color-gold);
  border-radius: 3px; flex-shrink: 0;
}
.section-subtitle { font-size: .8rem; color: var(--color-text-light); margin: 0; padding-left: .75rem; }

.header-actions { display: flex; gap: .6rem; flex-wrap: wrap; }

/* ── Buttons ── */
.btn-primary {
  display: inline-flex; align-items: center; gap: .45rem;
  padding: 0 1.2rem; height: 38px;
  background: var(--color-navy); color: var(--color-white);
  border: none; border-radius: 12px;
  font-size: .875rem; font-weight: 700;
  cursor: pointer; white-space: nowrap;
  box-shadow: 0 2px 8px rgba(12,59,94,.22);
  transition: all .18s ease;
}
.btn-primary:hover { background: var(--color-primary); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(3,105,161,.28); }
.btn-primary i    { color: var(--color-gold); font-size: .8rem; transition: transform .2s; }
.btn-primary:hover i { transform: rotate(90deg); }

.btn-gold { background: #92700a; }
.btn-gold:hover { background: #7a5200; }
.btn-gold i { color: #fde68a; }

.btn-secondary {
  display: inline-flex; align-items: center; gap: .45rem;
  padding: 0 1.2rem; height: 38px;
  background: var(--color-primary-light); color: var(--color-white);
  border: none; border-radius: 12px;
  font-size: .875rem; font-weight: 600;
  cursor: pointer; white-space: nowrap;
  box-shadow: 0 2px 8px rgba(31,141,191,.25);
  transition: all .18s ease;
}
.btn-secondary:hover { background: var(--color-primary); transform: translateY(-1px); }
.btn-secondary i { font-size: .8rem; }

.btn-outline {
  display: inline-flex; align-items: center; gap: .45rem;
  padding: 0 1.2rem; height: 38px;
  background: var(--color-white); color: var(--color-primary);
  border: 1.5px solid rgba(3,105,161,.3); border-radius: 12px;
  font-size: .875rem; font-weight: 600;
  cursor: pointer; white-space: nowrap;
  transition: all .18s ease;
}
.btn-outline:hover { background: var(--color-gray-bg); border-color: var(--color-gold); color: var(--color-navy); transform: translateY(-1px); }
.btn-outline i { font-size: .8rem; }

/* ── Controls Bar ── */
.controls-bar {
  display: flex; flex-wrap: wrap; gap: .75rem;
  align-items: center;
  padding: .85rem 1rem;
  background: var(--color-gray-bg);
  border-radius: 14px;
  border: 0.5px solid var(--color-gray-border);
  margin-bottom: 1rem;
}
.search-wrapper {
  position: relative; flex: 2; min-width: 200px;
  display: flex; align-items: center;
}
.search-icon { position: absolute; left: 12px; color: var(--color-text-light); font-size: .82rem; pointer-events: none; }
.search-input {
  width: 100%; height: 38px;
  padding: 0 36px;
  border: 1.5px solid var(--color-gray-border);
  border-radius: 10px;
  font-size: .875rem; color: var(--color-text-dark);
  background: var(--color-white);
  outline: none; transition: all .15s;
}
.search-input:focus { border-color: var(--color-primary-light); box-shadow: 0 0 0 3px rgba(31,141,191,.1); }
.search-input::placeholder { color: var(--color-text-light); }
.filter-select {
  height: 38px; padding: 0 .9rem;
  border: 1.5px solid var(--color-gray-border);
  border-radius: 10px;
  background: var(--color-white); color: var(--color-text-dark);
  font-size: .875rem; font-weight: 500;
  cursor: pointer; min-width: 145px; transition: border-color .15s;
}
.filter-select:focus { outline: none; border-color: var(--color-primary-light); box-shadow: 0 0 0 3px rgba(31,141,191,.08); }

/* ── Rooms Summary ── */
.rooms-summary {
  display: inline-flex; align-items: center; gap: .5rem;
  margin-bottom: 1rem;
  padding: .45rem 1.1rem;
  background: var(--color-gray-bg);
  border-radius: 30px; border: 0.5px solid var(--color-gray-border);
  color: var(--color-text-dark); font-size: .875rem; font-weight: 500;
}
.summary-icon { color: var(--color-gold); font-size: .9rem; }

/* ── Room Grid ── */
.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

/* ── Room Card (JS-generated) ── */
:global(.room-card) {
  background: var(--color-white);
  border-radius: 16px;
  border: 0.5px solid var(--color-gray-border);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(3,105,161,.07);
  transition: transform .22s, box-shadow .22s, border-color .22s;
}
:global(.room-card:hover) { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(3,105,161,.14); border-color: rgba(244,196,0,.4); }
:global(.rc-header) {
  background: var(--color-navy);
  border-bottom: 3px solid var(--color-gold);
  padding: .9rem 1rem;
  display: flex; justify-content: space-between; align-items: flex-start; gap: .5rem;
}
:global(.rc-name)  { color: var(--color-white); font-size: .95rem; font-weight: 700; }
:global(.rc-type)  { color: rgba(255,255,255,.55); font-size: .75rem; margin-top: 2px; }
:global(.rc-price) { color: var(--color-gold); font-size: .95rem; font-weight: 700; white-space: nowrap; }
:global(.rc-price span) { display: block; font-size: .7rem; font-weight: 400; color: rgba(255,255,255,.5); text-align: right; }
:global(.rc-badge-promo) {
  display: inline-block;
  background: #dc2626; color: var(--color-white);
  font-size: .65rem; font-weight: 700;
  padding: 2px 8px; border-radius: 20px;
  letter-spacing: .3px;
}
:global(.rc-body) { padding: .85rem 1rem; }
:global(.rc-status) {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 20px;
  font-size: 10px; font-weight: 700; letter-spacing: .3px;
  margin-bottom: .55rem;
}
:global(.s-a) { background: rgba(22,163,74,.1);  color: #15803d; border: 1px solid rgba(22,163,74,.25); }
:global(.s-o) { background: rgba(31,141,191,.1); color: var(--color-primary-light); border: 1px solid rgba(31,141,191,.25); }
:global(.s-m) { background: rgba(239,68,68,.1);  color: #dc2626; border: 1px solid rgba(239,68,68,.22); }
:global(.rc-desc) { font-size: .8rem; color: var(--color-text-dark); line-height: 1.5; margin: 0; }
:global(.rc-foot) {
  border-top: 1px solid var(--color-gray-border);
  background: var(--color-gray-bg);
  padding: .65rem 1rem;
  display: flex; justify-content: flex-end; gap: .4rem;
}

/* ── Promo List & Card ── */
.promo-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}
:global(.promo-card) {
  background: var(--color-white);
  border-radius: 14px;
  border: 0.5px solid var(--color-gray-border);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(3,105,161,.06);
  transition: transform .2s, box-shadow .2s, border-color .2s;
}
:global(.promo-card:hover) { transform: translateY(-3px); box-shadow: 0 8px 22px rgba(3,105,161,.12); border-color: rgba(244,196,0,.35); }
:global(.pc-header) {
  background: var(--color-navy);
  border-bottom: 3px solid var(--color-gold);
  padding: .85rem 1rem;
  display: flex; justify-content: space-between; align-items: center;
}
:global(.pc-code)  { color: var(--color-gold); font-size: 1rem; font-weight: 800; letter-spacing: 1px; }
:global(.pc-value) {
  background: rgba(244,196,0,.2); color: var(--color-gold);
  font-size: .75rem; font-weight: 700;
  padding: 3px 10px; border-radius: 20px;
  border: 1px solid rgba(244,196,0,.35);
}
:global(.pc-body) { padding: .85rem 1rem; }
:global(.pc-desc) { font-size: .8rem; color: var(--color-text-dark); line-height: 1.5; margin: 0 0 .5rem; }
:global(.pc-dates) {
  font-size: .75rem; color: var(--color-text-light);
  display: flex; align-items: center; gap: .4rem;
}
:global(.pc-dates i) { color: var(--color-primary-light); font-size: .7rem; }
:global(.pc-foot) {
  border-top: 1px solid var(--color-gray-border);
  background: var(--color-gray-bg);
  padding: .6rem 1rem;
  display: flex; justify-content: flex-end; gap: .4rem;
}

/* ── Action buttons (shared) ── */
:global(.act-btn) {
  width: 30px; height: 30px;
  border-radius: 8px;
  border: 1px solid var(--color-gray-border);
  background: var(--color-white);
  font-size: .78rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-light);
  transition: all .15s ease;
}
:global(.act-btn:hover) { transform: translateY(-1px); }
:global(.ebtn) { color: var(--color-primary-light); }
:global(.ebtn:hover) { background: var(--color-primary-light); color: var(--color-white); border-color: var(--color-primary-light); }
:global(.dbtn) { color: #ef4444; }
:global(.dbtn:hover) { background: #ef4444; color: var(--color-white); border-color: #ef4444; }

/* ── Empty State ── */
:global(.empty-state) {
  grid-column: 1 / -1;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: .75rem;
  padding: 3.5rem 2rem; text-align: center;
  border: 2px dashed rgba(244,196,0,.4);
  border-radius: 16px;
  background: rgba(244,196,0,.02);
}
:global(.empty-icon-wrap) {
  width: 60px; height: 60px; border-radius: 16px;
  background: rgba(3,105,161,.08); color: var(--color-primary-light);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem;
}
:global(.empty-title) { font-size: .95rem; font-weight: 700; color: var(--color-text-dark); margin: 0; }
:global(.empty-sub)   { font-size: .8rem; color: var(--color-text-light); margin: 0; }

/* ── Modals ── */
.modal {
  position: fixed; inset: 0;
  background: rgba(12,59,94,.55); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  visibility: hidden; opacity: 0;
  transition: all .25s ease; z-index: 1000; padding: 1rem;
}
.modal.show { visibility: visible; opacity: 1; }

.modal-box {
  background: var(--color-white);
  border-radius: 20px;
  width: 100%; max-width: 520px;
  max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 60px rgba(12,59,94,.22);
  animation: slideUp .22s ease;
  overflow: hidden;
}

.modal-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.1rem 1.4rem;
  background: var(--color-navy);
  border-bottom: 3px solid var(--color-gold);
  flex-shrink: 0;
}
.modal-head-left { display: flex; align-items: center; gap: .8rem; }
.modal-head-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgba(255,255,255,.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; color: var(--color-white); flex-shrink: 0;
}
.modal-head-icon--gold { background: rgba(244,196,0,.2); color: var(--color-gold); }
.modal-title { font-size: 1rem; font-weight: 700; color: var(--color-white); margin: 0; }
.modal-sub   { font-size: .72rem; color: rgba(255,255,255,.6); margin: 2px 0 0; }
.modal-close-btn {
  width: 32px; height: 32px; border-radius: 10px;
  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
  color: var(--color-white); font-size: .85rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.modal-close-btn:hover { background: rgba(255,255,255,.28); }

.modal-body {
  padding: 1.4rem; overflow-y: auto; flex: 1;
}
.modal-foot {
  display: flex; gap: .6rem; justify-content: flex-end;
  padding: 1rem 1.4rem;
  border-top: 1px solid var(--color-gray-border);
  background: var(--color-gray-bg);
  border-radius: 0 0 20px 20px;
  flex-shrink: 0;
}

.form-group     { margin-bottom: 1rem; }
.form-row       { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.form-label     { display: block; margin-bottom: .4rem; font-size: .72rem; font-weight: 700; color: var(--color-text-light); text-transform: uppercase; letter-spacing: .4px; }
.form-hint      { font-weight: 400; text-transform: none; letter-spacing: 0; font-size: .72rem; }
.req            { color: #ef4444; margin-left: 2px; }
.form-input {
  width: 100%; padding: .65rem .9rem;
  border: 1.5px solid var(--color-gray-border);
  border-radius: 10px; font-size: .9rem;
  color: var(--color-text-dark);
  background: var(--color-white);
  transition: all .15s; box-sizing: border-box;
  font-family: inherit;
}
.form-input:focus { outline: none; border-color: var(--color-primary-light); box-shadow: 0 0 0 3px rgba(31,141,191,.1); }
textarea.form-input { resize: vertical; }

.form-checkbox-row { display: flex; align-items: center; gap: .6rem; padding-top: 1.6rem; }
.form-checkbox     { width: 16px; height: 16px; accent-color: var(--color-primary-light); cursor: pointer; flex-shrink: 0; }
.checkbox-label    { margin: 0; text-transform: none; letter-spacing: 0; font-size: .875rem; color: var(--color-text-dark); font-weight: 500; }

.btn-cancel {
  padding: .55rem 1.1rem; border-radius: 10px;
  background: var(--color-white); color: var(--color-text-light);
  border: 1.5px solid var(--color-gray-border);
  font-size: .875rem; font-weight: 600; cursor: pointer;
  transition: all .15s;
}
.btn-cancel:hover { border-color: var(--color-primary-light); color: var(--color-primary); }

/* ── Responsive ── */
@media (max-width: 768px) {
  .section-header { flex-direction: column; align-items: flex-start; }
  .header-actions { width: 100%; }
  .btn-primary, .btn-secondary, .btn-outline { flex: 1; justify-content: center; }
  .controls-bar { flex-direction: column; }
  .filter-select { width: 100%; }
  .form-row { grid-template-columns: 1fr; }
  .room-grid, .promo-list { grid-template-columns: 1fr; }
  .modal-box { max-width: none; }
  .modal-body { padding: 1rem; }
}
</style>