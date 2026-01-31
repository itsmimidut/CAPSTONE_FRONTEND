<!-- src/components/RoomFormModal.vue -->
<template>
  <!-- Debug: Add data-state to check if show prop is working -->
  <div class="modal" :class="{ show: show }" @click.self="close" :data-show="show">
    <div class="modal-content">
      <div class="modal-header">
        <h3>
          <i class="fas fa-bed"></i>
          <span>{{ editing ? `Edit ${entityLabel}` : `Add New ${entityLabel}` }}</span>
        </h3>
        <button class="close-modal" @click="close">
          ×
        </button>
      </div>

      <div class="modal-body">
        <!-- Basic Information -->
        <div class="form-section">
          <div class="form-section-header">
            <i class="fas fa-info-circle"></i>
            <div>
              <h4>Basic Information</h4>
              <p>Enter room details and specifications</p>
            </div>
          </div>

          <div class="input-group">
            <div class="form-group">
              <label for="roomNumber">
                <i class="fas fa-hashtag"></i>
                {{ form.category_type === 'event' ? `${entityLabel} Location` : `${entityLabel} Number` }}
              </label>
              <input
                id="roomNumber"
                v-model="form.room_number"
                type="text"
                class="form-control roomid"
                :placeholder="form.category_type === 'event' ? 'Main Hall' : 'e.g., 101'"
                required
              />
            </div>

            <div class="form-group">
              <label for="roomName">
                <i class="fas fa-signature"></i> {{ entityLabel }} Name
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
              <label for="categoryType">
                <i class="fas fa-layer-group"></i> Category Type
              </label>
              <div class="select-wrapper">
                <select id="categoryType" v-model="form.category_type" class="form-control">
                  <option value="room">Room</option>
                  <option value="cottage">Cottage</option>
                  <option value="event">Event</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Images Upload -->
        <div class="image-upload-section">
          <div class="form-section-header">
            <i class="fas fa-images"></i>
            <div>
              <h4>{{ entityLabel }} Images</h4>
              <p>Upload high-quality photos of the {{ entityLabel.toLowerCase() }}</p>
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
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Drag & drop images here or click to browse</p>
            <small>Recommended: 5-8 high-quality images (JPEG, PNG, WebP)</small>
          </div>

          <div class="image-preview-container" v-if="imagePreviews.length">
            <div
              v-for="(preview, index) in imagePreviews"
              :key="index"
              class="image-preview"
            >
              <img :src="preview" :alt="`Room preview ${index + 1}`" />
              <div v-if="index === primaryImageIndex" class="primary-badge">Primary</div>

              <div class="image-preview-actions">
                <button
                  class="image-preview-btn set-primary"
                  :class="{ active: index === primaryImageIndex }"
                  @click="setPrimaryImage(index)"
                  title="Set as primary"
                >
                  <i class="fas fa-star"></i>
                </button>
                <button
                  class="image-preview-btn"
                  @click="removeImage(index)"
                  title="Remove image"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <div v-else class="text-center text-gray-400 py-6">
            No images uploaded yet
          </div>
        </div>

        <!-- Pricing & Capacity -->
        <div class="form-section">
          <div class="form-section-header">
            <i class="fas fa-money-bill-wave"></i>
            <div>
              <h4>Pricing & Capacity</h4>
              <p>Set room rates and guest limits</p>
            </div>
          </div>

          <div class="input-group">
            <div class="form-group">
              <label for="roomCapacity">
                <i class="fas fa-user-friends"></i> Capacity
              </label>
              <input
                id="roomCapacity"
                v-model.number="form.max_guests"
                type="number"
                min="1"
                class="form-control"
                placeholder="Number of guests"
              />
            </div>

            <div class="form-group">
              <label for="roomPrice">
                <i class="fas fa-dollar-sign"></i> Price per Night
              </label>
              <input
                id="roomPrice"
                v-model.number="form.price"
                type="number"
                min="0"
                step="0.01"
                class="form-control"
                placeholder="e.g., 199"
                required
              />
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="form-section">
          <div class="form-section-header">
            <i class="fas fa-align-left"></i>
            <div>
              <h4>Description</h4>
              <p>Describe the room features and amenities</p>
            </div>
          </div>

          <div class="textarea-group">
            <textarea
              id="roomDescription"
              v-model="form.description"
              rows="4"
              class="w-full"
              placeholder="Luxurious suite with panoramic ocean views, king-sized bed, and private balcony..."
            ></textarea>
          </div>
        </div>

        <!-- Status & Settings -->
        <div class="form-section">
          <div class="form-section-header">
            <i class="fas fa-toggle-on"></i>
            <div>
              <h4>Status & Settings</h4>
              <p>Configure room availability and promotions</p>
            </div>
          </div>

          <div class="input-group">
            <div class="form-group">
              <label for="roomStatus">
                <i class="fas fa-circle"></i> {{ entityLabel }} Status
              </label>
              <div class="select-wrapper">
                <select id="roomStatus" v-model="form.status" class="form-control">
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>
                <i class="fas fa-tag"></i> Promotional Offer
              </label>
              <div class="switch-container">
                <label class="switch">
                  <input type="checkbox" v-model="form.promo" />
                  <span class="slider"></span>
                </label>
                <span>Mark as "Limited Offer"</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-creative btn-creative-outline" @click="close">
          <i class="fas fa-times"></i> Cancel
        </button>
        <button class="btn-creative btn-creative-primary" @click="handleSave">
          <i class="fas fa-save"></i> Save {{ entityLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  initialRoom: { type: Object, default: null }
})

const emit = defineEmits(['update:show', 'save', 'close'])

// Debug: Log when component mounts and when props change
onMounted(() => {
  console.log('RoomModal mounted, show prop:', props.show)
})

// Watch show prop to debug
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
  description: '',
  status: 'Available',
  date: '',
  time: '',
  promo: false,
  images: [] // Will hold image data URLs (base64 from FileReader) or existing URLs
})

// Dynamic label based on category_type
const entityLabel = computed(() => {
  if (form.value.category_type === 'cottage') return 'Cottage'
  if (form.value.category_type === 'event') return 'Event'
  return 'Room'
})

/**
 * imagePreviews: Array of data URLs generated by FileReader for immediate UI display
 * This allows users to see their selected images before submitting the form
 * Each preview is a base64 encoded data URL: data:image/jpeg;base64,...
 */
const imagePreviews = ref([])
const primaryImageIndex = ref(0) // Track which image is marked as primary
const editing = ref(false)

const statusOptions = computed(() => {
  if (form.value.category_type === 'event') {
    return ['Available', 'Occupied', 'Under Maintenance']
  }
  return ['Available', 'Occupied', 'Under Maintenance']
})

// File input ref
const fileInput = ref(null)
const uploadArea = ref(null)

// ────────────────────────────────────────────────
// Watchers
// ────────────────────────────────────────────────
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      resetOrLoadForm()
    }
  }
)

watch(
  () => props.initialRoom,
  (room) => {
    if (room && props.show) {
      loadRoomData(room)
    }
  },
  { immediate: true }
)

// ────────────────────────────────────────────────
// Form Methods
// ────────────────────────────────────────────────
const resetForm = () => {
  form.value = {
    item_id: null, // Reset to null for new room creation
    room_number: '',
    name: '',
    category: 'Standard Room',
    category_type: 'room',
    max_guests: 2,
    price: null,
    description: '',
    status: 'Available',
    date: '',
    time: '',
    promo: false,
    images: []
  }
  // For events, ensure status is Available
  if (form.value.category_type === 'event') {
    form.value.status = 'Available'
  }
  imagePreviews.value = []
  primaryImageIndex.value = 0
  editing.value = false
}

const loadRoomData = (room) => {
  if (!room) return

  editing.value = true

  // When loading existing room: MUST include item_id to enable UPDATE mode instead of CREATE
  form.value = {
    item_id: room.item_id, // CRITICAL: This tells the backend to UPDATE instead of CREATE
    room_number: room.room_number || '',
    name: room.name || '',
    category: room.category || 'Standard Room',
    category_type: room.category_type || 'room',
    max_guests: room.max_guests || 2,
    price: room.price || null,
    description: room.description || '',
    status: room.status || 'Available',
    date: room.date || '',
    time: room.time || '',
    promo: !!room.promo,
    images: room.images ? [...room.images] : [] // Existing database URLs/paths
  }

  // For preview, display the existing image URLs directly
  imagePreviews.value = room.images ? [...room.images] : []
  primaryImageIndex.value = room.primaryImageIndex || 0
}

const resetOrLoadForm = () => {
  if (props.initialRoom) {
    loadRoomData(props.initialRoom)
  } else {
    resetForm()
  }
}

const validateForm = () => {
  if (!form.value.name.trim()) {
    alert('Room Name is required')
    return false
  }
  if (!form.value.room_number.trim()) {
    alert('Room Number is required')
    return false
  }
  if (form.value.category_type !== 'event') {
    if (!form.value.price || form.value.price <= 0) {
      alert('Valid Price per Night is required')
      return false
    }
  }
  // Images are optional - you can create a room without images
  return true
}

const handleSave = () => {
  if (!validateForm()) return

  // Prepare room data: use imagePreviews (which contains base64 data URLs)
  const roomData = {
    ...form.value,
    // If no category chosen, use the name as category label (per requirement to rely on name)
    category: form.value.category || form.value.name || '',
    images: [...imagePreviews.value], // Use imagePreviews, not form.value.images
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

// ────────────────────────────────────────────────
// Image Upload Logic — Handles file selection, preview generation, and validation
// ────────────────────────────────────────────────

/**
 * onDragOver: Visual feedback when user drags files over upload area
 * Changes border color and background to indicate drop zone is active
 */
const onDragOver = (e) => {
  e.preventDefault()
  uploadArea.value.style.borderColor = 'var(--primary)'
  uploadArea.value.style.background = 'rgba(99, 179, 237, 0.1)'
}

/**
 * onDragLeave: Reset visual feedback when user leaves drag area
 */
const onDragLeave = () => {
  uploadArea.value.style.borderColor = 'var(--primary-light)'
  uploadArea.value.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
}

/**
 * onDrop: Handle files dropped into upload area
 * Calls processFiles to validate and preview the dropped files
 */
const onDrop = (e) => {
  e.preventDefault()
  onDragLeave()
  const files = e.dataTransfer.files
  processFiles(files)
}

/**
 * handleFileChange: Handle files selected from file picker dialog
 * Calls processFiles to validate and preview the selected files
 */
const handleFileChange = (e) => {
  const files = e.target.files
  processFiles(files)
}

/**
 * processFiles: MAIN IMAGE UPLOAD FUNCTION
 * 1. Validates file type (only JPEG, PNG, WebP allowed)
 * 2. Validates file size (max 5MB per file)
 * 3. Uses FileReader to convert selected file to base64 data URL
 * 4. Stores data URL in imagePreviews for immediate display in modal
 * 5. Sets first image as primary if no primary exists
 * 
 * WHY BASE64?
 * The backend (reservision-backend) stores images as JSON in the database (inventory_items.images)
 * Not as files on disk. So we send base64 encoded data directly to the server,
 * which stores it as-is in the images column.
 * 
 * Flow:
 * 1. User selects image → FileReader converts to base64 → Display preview immediately ✓
 * 2. User clicks save → Base64 strings sent as JSON to backend ✓
 * 3. Backend stores as JSON: ["data:image/jpeg;base64,...", "data:image/png;base64,..."] ✓
 * 4. Next time room loads → Images displayed from data URLs ✓
 */
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

    // Generate data URL preview for immediate display in modal
    // FileReader reads file asynchronously and converts to data:image/...
    const reader = new FileReader()
    reader.onload = (ev) => {
      // data URL looks like: data:image/jpeg;base64,/9j/4AAQSkZJRg...
      // This can be directly embedded in <img src="..."> or stored in database
      const dataUrl = ev.target.result
      // ONLY push to imagePreviews - don't duplicate in form.value.images
      imagePreviews.value.push(dataUrl)

      // If this is the first image, set as primary
      if (imagePreviews.value.length === 1) {
        primaryImageIndex.value = 0
      }
    }
    reader.readAsDataURL(file)
  })
}

/**
 * setPrimaryImage: Set which image preview is marked as "Primary"
 * The primary image will be shown as the room's main thumbnail in the list
 */
const setPrimaryImage = (index) => {
  primaryImageIndex.value = index
}

/**
 * removeImage: Delete an image from preview
 * 1. Removes from preview display
 * 2. Adjusts primaryImageIndex if needed
 */
const removeImage = (index) => {
  imagePreviews.value.splice(index, 1)

  // If removed image was the primary, adjust primary index
  if (primaryImageIndex.value === index) {
    primaryImageIndex.value = Math.max(0, primaryImageIndex.value - 1)
  } else if (primaryImageIndex.value > index) {
    primaryImageIndex.value--
  }
}

/**
 * openFileDialog: Programmatically open native file picker
 * Called when user clicks the upload area (click to browse)
 */
const openFileDialog = () => {
  fileInput.value.click()
}

onMounted(() => {
  if (uploadArea.value) {
    uploadArea.value.addEventListener('click', openFileDialog)
  }
})
</script>

<style scoped>
/* Optional: component-specific overrides if needed */
/* Most styles are already in admin-theme.css */
.modal {
  z-index: 9999;
}

.input-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
  align-items: center;
}

@media (max-width: 640px) {
  .input-group {
    grid-template-columns: 1fr;
  }
}
</style>
<style scoped src="../../../assets/room.css"></style>