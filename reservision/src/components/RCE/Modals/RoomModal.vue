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
          
          <!-- Extract Text Button -->
          <div v-if="imagePreviews.length" class="extract-text-button-group">
            <button
              class="btn-extract-text"
              @click="extractTextFromImages()"
              :disabled="isExtractingText"
              :title="isExtractingText ? 'Extraction in progress...' : 'Re-extract text'"
            >
              <i class="fas fa-wand-magic-sparkles"></i>
              {{ isExtractingText ? 'Extracting...' : 'Extract Text' }}
            </button>
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

            <!-- Toolbar -->
            <div class="editor-toolbar">
              <button @click="format('bold')"><b>B</b></button>
              <button @click="format('italic')"><i>I</i></button>
              <button @click="format('insertUnorderedList')">• List</button>
              <button @click="format('insertOrderedList')">1. List</button>
            </div>

            <!-- Rich Editor -->
            <div
              id="roomDescription"
              class="form-control rich-editor"
              contenteditable="true"
              v-html="form.description"
              @input="onDescriptionInput"
            ></div>

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

      <div v-if="isExtractingText" class="ocr-overlay">
        <div class="ocr-overlay-card">
          <div class="ocr-overlay-icon"><i class="fas fa-spinner fa-spin"></i></div>
          <h4>Extracting Text</h4>
          <p>Auto-filling details from uploaded image {{ ocrCurrentImage }} of {{ ocrTotalImages }}</p>
          <div class="ocr-overlay-track">
            <div class="ocr-overlay-fill" :style="{ width: `${extractProgress}%` }"></div>
          </div>
          <strong class="ocr-overlay-percent">{{ extractProgress }}%</strong>
        </div>
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
const BACKEND_URL = 'http://localhost:8000'

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

const onDescriptionInput = (e) => {
  form.value.description = e.target.innerHTML
}

const format = (command) => {
  document.execCommand(command, false, null)
}

/**
 * existingImages: paths already stored on the server (e.g. /uploads/rooms/xxx.jpg)
 * newFileItems: newly selected File objects + their blob preview URLs
 * imagePreviews: computed combination for template display
 */
const existingImages = ref([])   // server paths kept from DB
const newFileItems = ref([])     // { src: blobUrl, file: File }
const isExtractingText  = ref(false)
const extractProgress   = ref(0)
const ocrCurrentImage   = ref(0)
const ocrTotalImages    = ref(0)
const extractedImageText = ref('')
const resolveImageSrc = (src) => {
  if (!src) return ''
  if (src.startsWith('blob:') || src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) return src
  return src.startsWith('/') ? `${BACKEND_URL}${src}` : `${BACKEND_URL}/${src}`
}
const imagePreviews = computed(() => [
  ...existingImages.value.map(resolveImageSrc),
  ...newFileItems.value.map(i => i.src)
])
const primaryImageIndex = ref(0) // Track which image is marked as primary
const editing = ref(false)
const uploadArea = ref(null)   // ref for the drag-and-drop zone element
const fileInput = ref(null)    // ref for the hidden <input type="file">
watch(() => props.show,        (v)    => { if (v) resetOrLoadForm() })
watch(() => props.initialRoom, (room) => { if (room && props.show) loadRoomData(room) }, { immediate: true })

const resetForm = () => {
  newFileItems.value.forEach(item => URL.revokeObjectURL(item.src))
  form.value = {
    item_id: null, room_number: '', name: '', category: 'Standard Room',
    category_type: 'room', max_guests: 2, price: null, quantity: 1,
    description: '', status: 'Available', date: '', time: '', promo: false, images: []
  }
  existingImages.value = []
  newFileItems.value = []
  isExtractingText.value  = false
  extractProgress.value   = 0
  ocrCurrentImage.value   = 0
  ocrTotalImages.value    = 0
  extractedImageText.value = ''
  primaryImageIndex.value = 0
  editing.value = false
}

const loadRoomData = (room) => {
  if (!room) return
  newFileItems.value.forEach(item => URL.revokeObjectURL(item.src))
  editing.value = true
  form.value = {
    item_id: room.item_id, room_number: room.room_number || '',
    name: room.name || '', category_type: room.category_type || 'room',
    max_guests: room.max_guests || 2, price: room.price || null,
    quantity: room.quantity || 1, description: convertToHTML(room.description || ''),
    status: room.status || 'Available', promo: !!room.promo,
    category: '', date: '', time: '', images: []
  }

  // Load existing image paths from DB for display; no new files yet
  existingImages.value = room.images ? [...room.images] : []
  newFileItems.value = []
  primaryImageIndex.value = room.primaryImageIndex || 0
}

const convertToHTML = (text) => {
  if (!text) return ''

  // If already HTML, return as-is
  if (text.includes('<')) return text

  // Convert lines to list
  const lines = text.split('\n').filter(l => l.trim())

  return `<ul>${lines.map(l => `<li>${l.replace('* ', '')}</li>`).join('')}</ul>`
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
  const acceptedSources = []

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
    acceptedSources.push(src)

    if (isFirst) {
      primaryImageIndex.value = 0
    }
  })

  if (acceptedSources.length > 0) {
    extractTextFromImages(acceptedSources)
  }
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

// ── Preprocess image on a canvas: grayscale + contrast boost + 2× scale ──────
const preprocessImageForOCR = (src) => new Promise((resolve) => {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const scale   = Math.min(3, 2400 / Math.max(img.width, img.height, 1))
    const canvas  = document.createElement('canvas')
    canvas.width  = img.width  * scale
    canvas.height = img.height * scale
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const d = imageData.data
    const contrast = 2.0  // >1 boosts contrast; helps white-on-colour text

    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
      const adjusted = Math.min(255, Math.max(0, (gray - 128) * contrast + 128))
      d[i] = d[i + 1] = d[i + 2] = adjusted
    }
    ctx.putImageData(imageData, 0, 0)
    resolve(canvas.toDataURL('image/png'))
  }
  img.onerror = () => resolve(src)   // fall back to original if load fails
  img.src = src
})

const cleanOCRText = (raw) =>
  raw
    .split('\n')
    .map(l => l.replace(/[^\x20-\x7E\u00C0-\u024F]/g, ' ').replace(/\s{3,}/g, '  ').trim())
    .filter(l => l.length > 1)
    .join('\n')

const extractTextFromImages = async (customSources = null) => {
  const sources = Array.isArray(customSources) && customSources.length
    ? customSources
    : [
      ...existingImages.value.map(resolveImageSrc),
      ...newFileItems.value.map(item => item.src)
    ]

  if (!sources.length || isExtractingText.value) return

  isExtractingText.value   = true
  extractProgress.value    = 0
  ocrCurrentImage.value    = 0
  ocrTotalImages.value     = sources.length
  extractedImageText.value = ''

  let worker = null
  try {
    const { createWorker } = await import('tesseract.js')
    worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m?.status === 'recognizing text' && Number.isFinite(m?.progress)) {
          const base  = ((ocrCurrentImage.value - 1) / ocrTotalImages.value) * 100
          const slice = (1 / ocrTotalImages.value) * 100
          extractProgress.value = Math.min(99, Math.round(base + m.progress * slice))
        }
      }
    })

    // PSM 3 = fully automatic; best for poster/flyer mixed layouts
    await worker.setParameters({ tessedit_pageseg_mode: '3' })

    const chunks = []
    for (let i = 0; i < sources.length; i++) {
      ocrCurrentImage.value = i + 1
      const preprocessed = await preprocessImageForOCR(sources[i])
      const { data } = await worker.recognize(preprocessed)
      const text = cleanOCRText(String(data?.text || ''))
      if (text) chunks.push(sources.length > 1 ? `[Image ${i + 1}]\n${text}` : text)
    }

    extractProgress.value    = 100
    extractedImageText.value = chunks.join('\n\n').trim()
    smartAutoFill()

    if (!extractedImageText.value) {
      alert('No readable text found. Try an image with clearer, darker text on a light background.')
    }
  } catch (error) {
    console.error('OCR extraction failed:', error)
    alert('Text extraction failed: ' + (error?.message || error))
  } finally {
    isExtractingText.value = false
    if (worker) { try { await worker.terminate() } catch {} }
  }
}

// ── Smart Auto-Fill: parse extracted text → populate form fields ──────────────
const smartAutoFill = () => {
  const text = extractedImageText.value
  if (!text.trim()) return []

  const filled = []

  // Room / entity name — common resort room types
  const nameMatch = text.match(
    /\b(FAMILY\s+ROOM|DELUXE\s+ROOM|STANDARD\s+ROOM|SUITE|COTTAGE|VILLA|SINGLE\s+ROOM|DOUBLE\s+ROOM|TWIN\s+ROOM|SUPERIOR\s+ROOM|BARKADA\s+ROOM|VIP\s+ROOM)\b/i
  )
  if (nameMatch) {
    form.value.name = nameMatch[0].replace(/\s+/g, ' ').trim()
    filled.push('Name')
  }

  // Price — PHP 4,000 / PHP4000 patterns
  const priceMatch = text.match(/PHP\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i)
  if (priceMatch) {
    form.value.price = parseFloat(priceMatch[1].replace(/,/g, ''))
    filled.push('Price')
  }

  // Capacity — "good for X pax" / "X persons" / "for X guests"
  const paxMatch = text.match(/(?:good\s+for\s+|up\s+to\s+|for\s+)(\d+)\s*(?:pax|person|people|guests?)/i)
  if (paxMatch) {
    form.value.max_guests = parseInt(paxMatch[1])
    filled.push('Capacity')
  }

  // Description — everything between inclusions header and check-in / extra person / contact block
  const descBlock = text.match(
    /(?:ROOM\s+INCLUSIONS?|INCLUSIONS?|INCLUDES?):?([\s\S]*?)(?:CHECK\s+IN|EXTRA\s+PERSON|FOR\s+MORE\s+INFO|$)/i
  )
  if (descBlock) {
    const lines = descBlock[1]
      .split('\n')
      .map(l => l.replace(/^[-•·*\u2022\s]+/, '').trim())
      .filter(l => l.length > 2)
    if (lines.length) {
      form.value.description = `
      <ul>
        ${lines.map(l => `<li>${l}</li>`).join('')}
      </ul>
      `
      filled.push('Description')
    }
  }

  if (!filled.includes('Description') && text.trim() && !String(form.value.description || '').trim()) {
    form.value.description = text.trim().slice(0, 1200)
    filled.push('Description')
  }

  return filled
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
  position: relative;
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
  color: var(--color-text-dark); margin: 0;
}
.modal-sub {
  font-size: 0.7rem; color: rgba(17, 13, 13, 0.65); margin: 2px 0 0;
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

.rich-editor {
  min-height: 120px;
  padding: 0.6rem 0.85rem;
  border: 1.5px solid var(--color-gray-border);
  border-radius: 9px;
  background: var(--color-white);
  overflow-y: auto;
}

.rich-editor:focus {
  outline: none;
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(31,141,191,0.1);
}

.editor-toolbar {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.4rem;
}

.editor-toolbar button {
  padding: 4px 8px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

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

.ocr-overlay {
  position: absolute;
  inset: 0;
  background: rgba(12,59,94,0.58);
  backdrop-filter: blur(3px);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
}

.ocr-overlay-card {
  width: min(420px, 88%);
  background: #ffffff;
  border-radius: 14px;
  padding: 1rem 1.1rem;
  box-shadow: 0 10px 30px rgba(12,59,94,0.28);
  text-align: center;
}

.ocr-overlay-icon {
  font-size: 1.35rem;
  color: var(--color-primary);
}

.ocr-overlay-card h4 {
  margin: 0.45rem 0 0.25rem;
  color: var(--color-navy);
  font-size: 1rem;
}

.ocr-overlay-card p {
  margin: 0;
  color: var(--color-text-light);
  font-size: 0.8rem;
}

.ocr-overlay-track {
  margin-top: 0.75rem;
  height: 10px;
  border-radius: 999px;
  background: #dbeafe;
  overflow: hidden;
}

.ocr-overlay-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #0ea5e9 0%, #0369a1 100%);
  transition: width 0.18s ease;
}

.ocr-overlay-percent {
  display: block;
  margin-top: 0.5rem;
  color: var(--color-navy);
  font-size: 0.82rem;
}

/* OCR section */
.ocr-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.btn-ocr,
.btn-ocr-apply,
.btn-ocr-autofill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 9px;
  border: none;
  padding: 0.55rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-ocr {
  background: var(--color-primary);
  color: var(--color-white);
}

.btn-ocr:hover { background: var(--color-primary-dark); }

.btn-ocr:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.btn-ocr-apply {
  background: #0c3b5e;
  color: var(--color-white);
}
.btn-ocr-apply:hover { background: #0a314d; }

.btn-ocr-autofill {
  background: #047857;
  color: var(--color-white);
}
.btn-ocr-autofill:hover { background: #065f46; }

.ocr-fill-summary {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.6rem;
  padding: 0.55rem 0.8rem;
  border-radius: 8px;
  background: #ecfdf5;
  color: #065f46;
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid #a7f3d0;
}

.ocr-hint {
  font-weight: 400;
  color: var(--color-text-light);
  font-size: 0.7rem;
  text-transform: none;
  letter-spacing: 0;
}

.ocr-progress-wrap { margin-top: 0.75rem; }

.ocr-progress-track {
  height: 10px;
  border-radius: 999px;
  background: #dbeafe;
  overflow: hidden;
}

.ocr-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #0369a1, #1f8dbf);
  transition: width 0.2s ease;
}

.ocr-progress-label {
  margin: 0.35rem 0 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-light);
}

.ocr-result-wrap { margin-top: 0.75rem; }

.textarea-group .form-control { width: 100%; }

/* Extract Text Button */
.extract-text-button-group {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.85rem;
  margin-bottom: 0;
}

.btn-extract-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.35rem;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  color: var(--color-white);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 4px 12px rgba(3,105,161,0.2);
}

.btn-extract-text:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(3,105,161,0.32);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
}

.btn-extract-text:disabled {
  background: linear-gradient(135deg, #94a3b8 0%, #6b7280 100%);
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.btn-extract-text i {
  font-size: 0.95rem;
}
</style>
<style scoped src="../../../assets/room.css"></style>