<template>
  <div class="modal" :class="{ show: show }" @click.self="close" :data-show="show">
    <div class="modal-content">

      <!-- Header: navy + gold border — matches all other modals in the system -->
      <div class="modal-header">
        <div class="modal-head-left">
          <div class="modal-head-icon">
            <i class="fas fa-bed"></i>
          </div>
          <div>
            <h3 class="modal-title">{{ editing ? `Edit ${entityLabel}` : `Add New ${entityLabel}` }}</h3>
            <p class="modal-sub">Fill in the details below</p>
          </div>
        </div>
        <button class="close-modal" @click="close">×</button>
      </div>

      <div class="modal-body">

        <!-- ── Basic Information ── -->
        <div class="form-section">
          <div class="form-section-header">
            <div class="section-icon">
              <i class="fas fa-info-circle"></i>
            </div>
            <div>
              <h4 class="section-heading">Basic Information</h4>
              <p class="section-sub">Enter room details and specifications</p>
            </div>
          </div>

          <div class="input-group">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-hashtag label-icon"></i>
                {{ form.category_type === 'event' ? `${entityLabel} Location` : `${entityLabel} Number` }}
              </label>
              <input
                id="roomNumber"
                v-model="form.room_number"
                type="text"
                class="form-control"
                :placeholder="form.category_type === 'event' ? 'Main Hall' : 'e.g., 101'"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-signature label-icon"></i> {{ entityLabel }} Name
              </label>
              <input
                id="roomName"
                v-model="form.name"
                type="text"
                class="form-control"
                placeholder="e.g., Ocean View Suite"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-layer-group label-icon"></i> Category Type
              </label>
              <div class="select-wrapper">
                <select id="categoryType" v-model="form.category_type" class="form-control">
                  <option value="room">Room</option>
                  <option value="cottage">Cottage</option>
                  <option value="event">Event</option>
                </select>
                <i class="fas fa-chevron-down select-arrow"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Images Upload ── -->
        <div class="form-section">
          <div class="form-section-header">
            <div class="section-icon">
              <i class="fas fa-images"></i>
            </div>
            <div>
              <h4 class="section-heading">{{ entityLabel }} Images</h4>
              <p class="section-sub">Upload high-quality photos of the {{ entityLabel.toLowerCase() }}</p>
            </div>
          </div>

          <div
            ref="uploadArea"
            class="image-upload-area"
            @dragover.prevent="onDragOver"
            @dragleave="onDragLeave"
            @drop.prevent="onDrop"
          >
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              class="hidden"
              @change="handleFileChange"
            />
            <i class="fas fa-cloud-upload-alt upload-icon"></i>
            <p class="upload-text">Drag & drop images here or click to browse</p>
            <small class="upload-hint">Recommended: 5–8 high-quality images (JPEG, PNG, WebP)</small>
          </div>

          <div class="image-preview-container" v-if="imagePreviews.length">
            <div
              v-for="(preview, index) in imagePreviews"
              :key="index"
              class="image-preview"
              :class="{ 'image-preview--primary': index === primaryImageIndex }"
            >
              <img :src="preview" :alt="`Room preview ${index + 1}`" />
              <div v-if="index === primaryImageIndex" class="primary-badge">Primary</div>
              <div class="image-preview-actions">
                <button
                  class="image-preview-btn set-primary"
                  :class="{ active: index === primaryImageIndex }"
                  @click="setPrimaryImage(index)"
                  title="Set as primary"
                ><i class="fas fa-star"></i></button>
                <button
                  class="image-preview-btn remove-img"
                  @click="removeImage(index)"
                  title="Remove image"
                ><i class="fas fa-times"></i></button>
              </div>
            </div>
          </div>

          <div v-else class="no-images">
            <i class="fas fa-images no-images-icon"></i>
            <p>No images uploaded yet</p>
          </div>
        </div>

        <!-- ── Pricing & Capacity ── -->
        <div class="form-section">
          <div class="form-section-header">
            <div class="section-icon">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <div>
              <h4 class="section-heading">Pricing & Capacity</h4>
              <p class="section-sub">Set room rates and guest limits</p>
            </div>
          </div>

          <div class="input-group">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-user-friends label-icon"></i> Capacity
              </label>
              <input
                id="roomCapacity"
                v-model.number="form.max_guests"
                type="number" min="1"
                class="form-control"
                placeholder="Number of guests"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-peso-sign label-icon"></i> Price per Night
              </label>
              <input
                id="roomPrice"
                v-model.number="form.price"
                type="number" min="0" step="0.01"
                class="form-control"
                placeholder="e.g., 1999"
                required
              />
            </div>
          </div>
        </div>

        <!-- ── Description ── -->
        <div class="form-section">
          <div class="form-section-header">
            <div class="section-icon">
              <i class="fas fa-align-left"></i>
            </div>
            <div>
              <h4 class="section-heading">Description</h4>
              <p class="section-sub">Describe the room features and amenities</p>
            </div>
          </div>

          <div class="textarea-group">
            <textarea
              id="roomDescription"
              v-model="form.description"
              rows="4"
              class="form-control"
              placeholder="Luxurious suite with panoramic ocean views, king-sized bed, and private balcony…"
            ></textarea>
          </div>
        </div>

        <!-- ── Status & Settings ── -->
        <div class="form-section">
          <div class="form-section-header">
            <div class="section-icon">
              <i class="fas fa-toggle-on"></i>
            </div>
            <div>
              <h4 class="section-heading">Status & Settings</h4>
              <p class="section-sub">Configure room availability and promotions</p>
            </div>
          </div>

          <div class="input-group">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-circle label-icon"></i> {{ entityLabel }} Status
              </label>
              <div class="select-wrapper">
                <select id="roomStatus" v-model="form.status" class="form-control">
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
                <i class="fas fa-chevron-down select-arrow"></i>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-box label-icon"></i> Quantity Available
              </label>
              <div class="select-wrapper">
                <select id="quantity" v-model.number="form.quantity" class="form-control">
                  <option v-for="n in 50" :key="n" :value="n">
                    {{ n }} {{ n === 1 ? entityLabel : entityLabel + 's' }}
                  </option>
                </select>
                <i class="fas fa-chevron-down select-arrow"></i>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-tag label-icon"></i> Promotional Offer
              </label>
              <div class="switch-container">
                <label class="switch">
                  <input type="checkbox" v-model="form.promo" />
                  <span class="slider" :class="{ 'slider--on': form.promo }"></span>
                </label>
                <span class="switch-label">Mark as "Limited Offer"</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn-cancel" @click="close">
          <i class="fas fa-times"></i> Cancel
        </button>
        <button class="btn-submit" @click="handleSave">
          <i class="fas fa-save"></i> Save {{ entityLabel }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue'

const props = defineProps({
  show:        { type: Boolean, default: false },
  initialRoom: { type: Object,  default: null  }
})

const emit = defineEmits(['update:show', 'save', 'close'])

onMounted(() => {
  console.log('RoomModal mounted, show prop:', props.show)
})

watch(() => props.show, (newVal) => {
  console.log('show prop changed to:', newVal)
})

const form = ref({
  item_id: null, // IMPORTANT: Store the room ID for updates (null = new room, number = edit mode)
  room_number: '',
  name: '',
  category: '',
  category_type: 'room',
  max_guests: 2,
  price: null,
  quantity: 1,
  description: '',
  status: 'Available',
  date: '',
  time: '',
  promo: false,
  images: [] // Kept for backward compat; actual images tracked via existingImages/newFileItems
})

const entityLabel = computed(() => {
  if (form.value.category_type === 'cottage') return 'Cottage'
  if (form.value.category_type === 'event')   return 'Event'
  return 'Room'
})

/**
 * existingImages: paths already stored on the server (e.g. /uploads/rooms/xxx.jpg)
 * newFileItems: newly selected File objects + their blob preview URLs
 * imagePreviews: computed combination for template display
 */
const existingImages = ref([])   // server paths kept from DB
const newFileItems = ref([])     // { src: blobUrl, file: File }
const imagePreviews = computed(() => [
  ...existingImages.value,
  ...newFileItems.value.map(i => i.src)
])
const primaryImageIndex = ref(0) // Track which image is marked as primary
const editing = ref(false)
const uploadArea = ref(null)   // ref for the drag-and-drop zone element
const fileInput = ref(null)    // ref for the hidden <input type="file">
watch(() => props.show,        (v)    => { if (v) resetOrLoadForm() })
watch(() => props.initialRoom, (room) => { if (room && props.show) loadRoomData(room) }, { immediate: true })

const resetForm = () => {
  form.value = {
    item_id: null, room_number: '', name: '', category: 'Standard Room',
    category_type: 'room', max_guests: 2, price: null, quantity: 1,
    description: '', status: 'Available', date: '', time: '', promo: false, images: []
  }
  existingImages.value = []
  newFileItems.value = []
  primaryImageIndex.value = 0
  editing.value = false
}

const loadRoomData = (room) => {
  if (!room) return
  editing.value = true
  form.value = {
    item_id: room.item_id, room_number: room.room_number || '',
    name: room.name || '', category: room.category || 'Standard Room',
    category_type: room.category_type || 'room', max_guests: room.max_guests || 2,
    price: room.price || null, description: room.description || '',
    status: room.status || 'Available', date: room.date || '',
    time: room.time || '', promo: !!room.promo,
    images: room.images ? [...room.images] : []
  }

  // Load existing image paths from DB for display; no new files yet
  existingImages.value = room.images ? [...room.images] : []
  newFileItems.value = []
  primaryImageIndex.value = room.primaryImageIndex || 0
}

const resetOrLoadForm = () => {
  if (props.initialRoom) loadRoomData(props.initialRoom)
  else resetForm()
}

const validateForm = () => {
  if (!form.value.name.trim())        { alert('Room Name is required'); return false }
  if (!form.value.room_number.trim()) { alert('Room Number is required'); return false }
  if (form.value.category_type !== 'event' && (!form.value.price || form.value.price <= 0)) {
    alert('Valid Price per Night is required'); return false
  }
  return true
}

const handleSave = () => {
  if (!validateForm()) return

  // Prepare room data: use existingImages (server paths) and newFiles (File objects)
  const roomData = {
    ...form.value,
    // If no category chosen, use the name as category label (per requirement to rely on name)
    category: form.value.category || form.value.name || '',
    existingImages: [...existingImages.value], // server paths to keep
    newFiles: newFileItems.value.map(i => i.file), // File objects for upload
    primaryImageIndex: primaryImageIndex.value
  }

  // Emit to parent (RoomAndCottage.vue) which calls store.saveRoom()
  emit('save', roomData)
  close()
}

const close = () => {
  emit('update:show', false)
  emit('close')
  nextTick(() => resetForm())
}

const onDragOver = () => {
  if (uploadArea.value) {
    uploadArea.value.classList.add('upload-drag-over')
  }
}
const onDragLeave = () => {
  if (uploadArea.value) uploadArea.value.classList.remove('upload-drag-over')
}
const onDrop = (e) => {
  onDragLeave()
  processFiles(e.dataTransfer.files)
}
const handleFileChange = (e) => processFiles(e.target.files)

const processFiles = (files) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']

  Array.from(files).forEach((file) => {
    // Validate file type
    if (!validTypes.includes(file.type)) {
      alert(`File ${file.name} is not a supported image type.`)
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert(`File ${file.name} is too large (max 5MB)`)
      return
    }

    // Track whether this is the very first image before adding
    const isFirst = imagePreviews.value.length === 0

    // Create a temporary blob URL for immediate preview — no base64 conversion
    const src = URL.createObjectURL(file)
    newFileItems.value.push({ src, file })

    if (isFirst) {
      primaryImageIndex.value = 0
    }
  })
}

const setPrimaryImage = (index) => { primaryImageIndex.value = index }

const removeImage = (index) => {
  const existingCount = existingImages.value.length
  if (index < existingCount) {
    // Remove a server-stored path
    existingImages.value.splice(index, 1)
  } else {
    // Revoke blob URL and remove new file
    const fileIndex = index - existingCount
    URL.revokeObjectURL(newFileItems.value[fileIndex].src)
    newFileItems.value.splice(fileIndex, 1)
  }

  // If removed image was the primary, adjust primary index
  if (primaryImageIndex.value === index) {
    primaryImageIndex.value = Math.max(0, index - 1)
  } else if (primaryImageIndex.value > index) {
    primaryImageIndex.value--
  }
}
const openFileDialog = () => fileInput.value?.click()

onMounted(() => {
  if (uploadArea.value) uploadArea.value.addEventListener('click', openFileDialog)
})
</script>

<style scoped>
/* ── Eduardo's Resort Color Palette ── */
.modal,
.modal-content {
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

/* ── Modal overlay ── */
.modal {
  display: none;
  position: fixed; inset: 0;
  background: rgba(12,59,94,0.55);
  backdrop-filter: blur(5px);
  z-index: 9999;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}
.modal.show { display: flex; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* ── Modal box ── */
.modal-content {
  background: var(--color-white);
  border-radius: 18px;
  width: 100%;
  max-width: 760px;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(12,59,94,0.22);
  animation: slideUp 0.22s ease;
  border: none;
}
@keyframes slideUp {
  from { transform: translateY(18px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* ── Modal header: navy bg + gold bottom border ── */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.1rem 1.4rem;
  background: var(--color-navy);
  border-radius: 18px 18px 0 0;
  border-bottom: 3px solid var(--color-gold);
  position: sticky; top: 0; z-index: 10;
}
.modal-head-left {
  display: flex; align-items: center; gap: 0.75rem;
}
.modal-head-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; color: var(--color-gold); flex-shrink: 0;
}
.modal-title {
  font-size: 1rem; font-weight: 700;
  color: var(--color-white); margin: 0;
}
.modal-sub {
  font-size: 0.7rem; color: rgba(255,255,255,0.65); margin: 2px 0 0;
}
.close-modal {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  color: var(--color-white);
  font-size: 1.2rem; line-height: 1;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.close-modal:hover { background: rgba(255,255,255,0.28); }

/* ── Modal body ── */
.modal-body {
  padding: 1.25rem 1.4rem;
  display: flex; flex-direction: column; gap: 1rem;
  background: var(--color-gray-bg);
}

/* ── Form sections: #eff6ff container, matching MenuSection category blocks ── */
.form-section {
  background: #eff6ff;
  border-radius: 12px;
  padding: 1rem 1.1rem;
  border: none;
  box-shadow: 0 1px 4px rgba(3,105,161,0.06);
}

.form-section-header {
  display: flex; align-items: center; gap: 0.75rem;
  margin-bottom: 0.9rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid rgba(3,105,161,0.12);
}

.section-icon {
  width: 34px; height: 34px; border-radius: 9px;
  background: rgba(31,141,191,0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem; color: var(--color-primary-light); flex-shrink: 0;
}
.section-heading {
  font-size: 0.875rem; font-weight: 700;
  color: var(--color-navy); margin: 0;
}
.section-sub {
  font-size: 0.72rem; color: var(--color-text-light); margin: 1px 0 0;
}

/* ── Form controls ── */
.input-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
}
@media (max-width: 640px) {
  .input-group { grid-template-columns: 1fr; }
}

.form-group { display: flex; flex-direction: column; gap: 0.35rem; }

.form-label {
  font-size: 0.72rem; font-weight: 700;
  color: var(--color-text-light);
  text-transform: uppercase; letter-spacing: 0.4px;
  display: flex; align-items: center; gap: 0.35rem;
}
.label-icon { color: var(--color-gold-dark); font-size: 0.7rem; }

.form-control {
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: 1.5px solid var(--color-gray-border);
  border-radius: 9px;
  font-size: 0.875rem;
  color: var(--color-text-dark);
  background: var(--color-white);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}
.form-control:focus {
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(31,141,191,0.1);
}
textarea.form-control { resize: vertical; min-height: 90px; }

/* Select wrapper */
.select-wrapper { position: relative; width: 100%; }
.select-wrapper .form-control { appearance: none; padding-right: 2.4rem; }
.select-arrow {
  position: absolute; right: 0.9rem; top: 50%;
  transform: translateY(-50%);
  pointer-events: none; font-size: 0.7rem;
  color: var(--color-gold-dark);
}

/* ── Image upload area ── */
.image-upload-area {
  background: #dbeafe;
  border: 2px dashed rgba(3,105,161,0.25);
  border-radius: 12px;
  padding: 1.75rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.18s ease;
}
.image-upload-area:hover,
.image-upload-area.upload-drag-over {
  background: #bfdbfe;
  border-color: var(--color-primary-light);
}
.upload-icon  { font-size: 2rem; color: var(--color-primary-light); display: block; margin-bottom: 0.5rem; }
.upload-text  { font-size: 0.875rem; color: var(--color-primary); font-weight: 600; margin: 0; }
.upload-hint  { font-size: 0.72rem; color: var(--color-text-light); margin-top: 0.25rem; display: block; }

/* Image preview grid */
.image-preview-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 0.75rem;
  margin-top: 0.85rem;
}
.image-preview {
  position: relative; border-radius: 10px;
  border: 2px solid rgba(3,105,161,0.12);
  overflow: hidden; aspect-ratio: 1;
  transition: all 0.2s ease;
}
.image-preview--primary { border-color: var(--color-gold); }
.image-preview:hover { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(3,105,161,0.15); }
.image-preview img { width: 100%; height: 100%; object-fit: cover; }

.primary-badge {
  position: absolute; top: 0.4rem; left: 0.4rem;
  padding: 0.18rem 0.45rem; border-radius: 6px;
  font-size: 0.65rem; font-weight: 700;
  background: var(--color-gold); color: var(--color-navy); z-index: 2;
}

.image-preview-actions {
  position: absolute; bottom: 0.4rem; right: 0.4rem;
  display: flex; gap: 0.25rem;
  opacity: 0; transition: opacity 0.2s ease;
}
.image-preview:hover .image-preview-actions { opacity: 1; }

.image-preview-btn {
  width: 26px; height: 26px; border-radius: 50%;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem;
  transition: all 0.15s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
.set-primary         { background: var(--color-white); color: var(--color-text-light); }
.set-primary.active  { background: var(--color-gold); color: var(--color-navy); }
.set-primary:hover   { background: var(--color-gold); color: var(--color-navy); }
.remove-img          { background: var(--color-white); color: #ef4444; }
.remove-img:hover    { background: #ef4444; color: var(--color-white); }

/* No images placeholder */
.no-images {
  text-align: center; padding: 1.5rem;
  color: var(--color-text-light);
}
.no-images-icon {
  font-size: 2rem; color: rgba(3,105,161,0.2);
  display: block; margin-bottom: 0.4rem;
}

/* Toggle switch */
.switch-container {
  display: flex; align-items: center; gap: 0.65rem; margin-top: 0.25rem;
}
.switch {
  position: relative; display: inline-block;
  width: 44px; height: 22px; margin: 0; flex-shrink: 0;
}
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute; cursor: pointer;
  inset: 0; background: var(--color-gray-border);
  transition: background 0.25s; border-radius: 22px;
}
.slider--on { background: var(--color-primary-light); }
.slider:before {
  position: absolute; content: '';
  height: 16px; width: 16px;
  left: 3px; bottom: 3px;
  background: var(--color-white);
  transition: transform 0.25s; border-radius: 50%;
}
input:checked + .slider:before { transform: translateX(22px); }
.switch-label { font-size: 0.82rem; color: var(--color-text-dark); }

/* ── Modal footer ── */
.modal-footer {
  display: flex; gap: 0.65rem; justify-content: flex-end;
  padding: 1rem 1.4rem;
  border-top: 1px solid var(--color-gray-border);
  background: var(--color-white);
  border-radius: 0 0 18px 18px;
  position: sticky; bottom: 0; z-index: 10;
}

.btn-cancel {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.55rem 1.1rem; border-radius: 9px;
  background: var(--color-white); color: var(--color-text-light);
  border: 1.5px solid var(--color-gray-border);
  font-size: 0.875rem; font-weight: 600; cursor: pointer;
  transition: all 0.15s;
}
.btn-cancel:hover { border-color: var(--color-primary-light); color: var(--color-primary); }

/* Primary save button: navy + gold icon — consistent with all other modals */
.btn-submit {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.55rem 1.25rem; border-radius: 9px;
  background: var(--color-navy); color: var(--color-white);
  border: none; font-size: 0.875rem; font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(12,59,94,0.22);
  transition: all 0.15s;
}
.btn-submit:hover {
  background: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(3,105,161,0.28);
}
.btn-submit i { color: var(--color-gold); }

.textarea-group .form-control { width: 100%; }
</style>
<style scoped src="../../../assets/room.css"></style>