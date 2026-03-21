<template>
  <div class="admin-page">
    <AdminSidebar
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <AdminHeader
      title="Website Page Configuration"
      subtitle="Manage amenities and images for website pages"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
    />

    <main class="main-content">
      <div class="content-wrap">
        <div class="toolbar">
          <div class="toolbar-left">
            <div class="toolbar-status">
              <span class="status-dot" :class="{ live: !isLoading }"></span>
              <span>{{ isLoading ? 'Loading config...' : 'Live website configuration' }}</span>
            </div>
            <label class="page-select-wrap">
              <span>Page</span>
              <select v-model="selectedPageKey" @change="fetchConfig">
                <option v-for="option in pageOptions" :key="option.key" :value="option.key">
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>

          <div class="toolbar-actions">
            <button class="btn btn-ghost" type="button" @click="fetchConfig" :disabled="isLoading || isSaving">
              Reload
            </button>
            <button class="btn btn-primary" type="button" @click="saveConfig" :disabled="isLoading || isSaving">
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <p v-if="message.text" :class="['message', message.type === 'error' ? 'message-error' : 'message-success']">
          {{ message.text }}
        </p>

        <section v-if="isAmenitiesPage" class="panel">
          <h2 class="panel-title">Hero Section</h2>
          <div class="grid two-col">
            <label class="field">
              <span>Badge</span>
              <input v-model="amenitiesConfig.hero.badge" type="text" />
            </label>
            <label class="field">
              <span>Background Image URL</span>
              <input v-model="amenitiesConfig.hero.backgroundImage" type="text" placeholder="https://... or /uploads/..." />
            </label>
            <label class="field">
              <span>Title Line 1</span>
              <input v-model="amenitiesConfig.hero.titleLine1" type="text" />
            </label>
            <label class="field">
              <span>Title Line 2</span>
              <input v-model="amenitiesConfig.hero.titleLine2" type="text" />
            </label>
          </div>
          <label class="field">
            <span>Subtitle</span>
            <textarea v-model="amenitiesConfig.hero.subtitle" rows="3"></textarea>
          </label>

          <div class="upload-row">
            <input
              ref="heroUploadRef"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              class="hidden-input"
              @change="uploadAmenitiesHeroImage"
            />
            <button class="btn btn-ghost" type="button" @click="heroUploadRef?.click()" :disabled="isUploadingHero">
              {{ isUploadingHero ? 'Uploading Hero...' : 'Upload Hero Image' }}
            </button>
            <span class="upload-hint">Recommended: 1920x1080</span>
          </div>
        </section>

        <section v-if="isAmenitiesPage" class="panel">
          <div class="section-head">
            <h2 class="panel-title">Amenity Categories</h2>
            <button class="btn btn-ghost" type="button" @click="addCategory">Add Category</button>
          </div>

          <article v-for="(category, cIndex) in amenitiesConfig.categories" :key="`${category.id}-${cIndex}`" class="category-card">
            <div class="section-head">
              <h3 class="category-title">Category {{ cIndex + 1 }}</h3>
              <button class="btn btn-danger" type="button" @click="removeCategory(cIndex)">Remove Category</button>
            </div>

            <div class="grid two-col">
              <label class="field">
                <span>Category ID</span>
                <input v-model="category.id" type="text" placeholder="unique-id" />
              </label>
              <label class="field">
                <span>Heading</span>
                <input v-model="category.heading" type="text" />
              </label>
            </div>

            <label class="field">
              <span>Category Bullet Text</span>
              <input v-model="category.listText" type="text" />
            </label>

            <div class="section-head cards-head">
              <h4 class="cards-title">Amenity Cards</h4>
              <button class="btn btn-ghost" type="button" @click="addCard(cIndex)">Add Card</button>
            </div>

            <div v-for="(card, cardIndex) in category.cards" :key="`${category.id}-${cardIndex}`" class="amenity-card-form">
              <div class="section-head compact">
                <strong>Card {{ cardIndex + 1 }}</strong>
                <button class="btn btn-danger" type="button" @click="removeCard(cIndex, cardIndex)">Remove Card</button>
              </div>

              <div class="grid two-col">
                <label class="field">
                  <span>Title</span>
                  <input v-model="card.title" type="text" />
                </label>
                <label class="field inline-field">
                  <span>Bookable</span>
                  <input v-model="card.bookable" type="checkbox" />
                </label>
              </div>

              <label class="field">
                <span>Description</span>
                <textarea v-model="card.description" rows="3"></textarea>
              </label>

              <label class="field">
                <span>Button Link</span>
                <input v-model="card.buttonLink" type="text" placeholder="/reservation" />
              </label>

              <div class="images-wrap">
                <div class="section-head compact">
                  <strong>Images</strong>
                  <button class="btn btn-ghost" type="button" @click="addCardImage(cIndex, cardIndex)">Add Image URL</button>
                </div>

                <div v-for="(image, imgIndex) in card.images" :key="imgIndex" class="image-row">
                  <input
                    v-model="card.images[imgIndex]"
                    type="text"
                    class="image-input"
                    placeholder="https://... or /uploads/..."
                  />
                  <input
                    :ref="setCardUploadRef(cIndex, cardIndex, imgIndex)"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    class="hidden-input"
                    @change="uploadCardImage(cIndex, cardIndex, imgIndex, $event)"
                  />
                  <button
                    class="btn btn-ghost"
                    type="button"
                    @click="openCardImagePicker(cIndex, cardIndex, imgIndex)"
                    :disabled="isImageUploading(cIndex, cardIndex, imgIndex)"
                  >
                    {{ isImageUploading(cIndex, cardIndex, imgIndex) ? 'Uploading...' : 'Upload' }}
                  </button>
                  <button class="btn btn-danger" type="button" @click="removeCardImage(cIndex, cardIndex, imgIndex)">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section v-if="isAmenitiesPage" class="panel">
          <h2 class="panel-title">Call To Action</h2>
          <div class="grid two-col">
            <label class="field">
              <span>CTA Button Text</span>
              <input v-model="amenitiesConfig.cta.buttonText" type="text" />
            </label>
            <label class="field">
              <span>CTA Button Link</span>
              <input v-model="amenitiesConfig.cta.buttonLink" type="text" />
            </label>
          </div>
          <label class="field">
            <span>CTA Helper Text</span>
            <textarea v-model="amenitiesConfig.cta.helperText" rows="3"></textarea>
          </label>
        </section>

        <section v-if="!isAmenitiesPage" class="panel">
          <h2 class="panel-title">{{ selectedPageLabel }} Page Images</h2>
          <div class="grid two-col">
            <label class="field">
              <span>Hero Image URL</span>
              <input v-model="pageImageConfig.heroImage" type="text" placeholder="https://... or /uploads/..." />
            </label>
            <div class="field">
              <span>Upload Hero Image</span>
              <div class="upload-row">
                <input
                  ref="pageHeroUploadRef"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  class="hidden-input"
                  @change="uploadGenericHeroImage"
                />
                <button class="btn btn-ghost" type="button" @click="pageHeroUploadRef?.click()" :disabled="isUploadingHero">
                  {{ isUploadingHero ? 'Uploading Hero...' : 'Upload Hero Image' }}
                </button>
              </div>
            </div>
          </div>

          <div class="images-wrap">
            <div class="section-head compact">
              <strong>Page Image Assets</strong>
              <button class="btn btn-ghost" type="button" @click="addGenericImage">Add Image URL</button>
            </div>

            <div v-for="(image, imgIndex) in pageImageConfig.images" :key="`generic-${imgIndex}`" class="image-row">
              <input
                v-model="pageImageConfig.images[imgIndex]"
                type="text"
                class="image-input"
                placeholder="https://... or /uploads/..."
              />
              <input
                :ref="setGenericUploadRef(imgIndex)"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                class="hidden-input"
                @change="uploadGenericImage(imgIndex, $event)"
              />
              <button
                class="btn btn-ghost"
                type="button"
                @click="openGenericImagePicker(imgIndex)"
                :disabled="isGenericUploading(imgIndex)"
              >
                {{ isGenericUploading(imgIndex) ? 'Uploading...' : 'Upload' }}
              </button>
              <button class="btn btn-danger" type="button" @click="removeGenericImage(imgIndex)">Remove</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import axios from 'axios'
import AdminHeader from '../../components/Admin/AdminHeader.vue'
import AdminSidebar from '../../components/Admin/AdminSidebar.vue'

const API_BASE = 'http://localhost:8000/api/website-config'

const pageOptions = [
  { key: 'amenities', label: 'Amenities' },
  { key: 'landing', label: 'Landing' },
  { key: 'home', label: 'Home' },
  { key: 'swimming', label: 'Swimming' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'about', label: 'About' },
  { key: 'rates', label: 'Rates' },
  { key: 'contact', label: 'Contact' }
]

const defaultAmenitiesConfig = {
  hero: {
    badge: "Eduardo's Resort",
    titleLine1: 'World-Class',
    titleLine2: 'Amenities',
    subtitle:
      'From Olympic-sized pools to elegant dining and air-conditioned cottages - every detail is crafted for your ultimate relaxation, joy, and unforgettable memories.',
    backgroundImage: 'https://www.eduardosresort.com/images/IMG_4224.JPG'
  },
  categories: [],
  cta: {
    buttonText: 'Book Your Experience Today',
    buttonLink: '/reservation',
    helperText: 'Experience world-class amenities designed for unforgettable moments with family and friends.'
  }
}

const defaultImagePageConfig = {
  pageKey: 'generic',
  heroImage: '',
  images: []
}

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const selectedPageKey = ref('amenities')
const isLoading = ref(false)
const isSaving = ref(false)
const isUploadingHero = ref(false)
const message = reactive({ text: '', type: 'success' })

const heroUploadRef = ref(null)
const pageHeroUploadRef = ref(null)
const cardUploadRefs = ref({})
const genericUploadRefs = ref({})
const uploadingMap = ref({})

const amenitiesConfig = reactive(structuredClone(defaultAmenitiesConfig))
const pageImageConfig = reactive(structuredClone(defaultImagePageConfig))

const isAmenitiesPage = computed(() => selectedPageKey.value === 'amenities')
const selectedPageLabel = computed(() => pageOptions.find((p) => p.key === selectedPageKey.value)?.label || selectedPageKey.value)

const showMessage = (text, type = 'success') => {
  message.text = text
  message.type = type
  setTimeout(() => {
    if (message.text === text) message.text = ''
  }, 3500)
}

const sanitizeAmenitiesConfig = (raw) => {
  const fallback = structuredClone(defaultAmenitiesConfig)
  const source = raw && typeof raw === 'object' ? raw : fallback
  const categories = Array.isArray(source.categories) ? source.categories : []

  return {
    hero: {
      badge: String(source.hero?.badge || fallback.hero.badge),
      titleLine1: String(source.hero?.titleLine1 || fallback.hero.titleLine1),
      titleLine2: String(source.hero?.titleLine2 || fallback.hero.titleLine2),
      subtitle: String(source.hero?.subtitle || fallback.hero.subtitle),
      backgroundImage: String(source.hero?.backgroundImage || fallback.hero.backgroundImage)
    },
    categories: categories.map((cat, cIndex) => ({
      id: String(cat?.id || `category-${cIndex + 1}`),
      heading: String(cat?.heading || ''),
      listText: String(cat?.listText || ''),
      cards: Array.isArray(cat?.cards)
        ? cat.cards.map((card) => ({
            title: String(card?.title || ''),
            description: String(card?.description || ''),
            images: Array.isArray(card?.images) ? card.images.map((img) => String(img || '')).filter(Boolean) : [],
            bookable: Boolean(card?.bookable),
            buttonLink: String(card?.buttonLink || '/reservation')
          }))
        : []
    })),
    cta: {
      buttonText: String(source.cta?.buttonText || fallback.cta.buttonText),
      buttonLink: String(source.cta?.buttonLink || fallback.cta.buttonLink),
      helperText: String(source.cta?.helperText || fallback.cta.helperText)
    }
  }
}

const sanitizeImagePageConfig = (raw) => {
  const source = raw && typeof raw === 'object' ? raw : {}
  return {
    pageKey: String(source.pageKey || selectedPageKey.value),
    heroImage: String(source.heroImage || ''),
    images: Array.isArray(source.images) ? source.images.map((img) => String(img || '')).filter(Boolean) : []
  }
}

const assignAmenitiesConfig = (nextValue) => {
  const safe = sanitizeAmenitiesConfig(nextValue)
  amenitiesConfig.hero = safe.hero
  amenitiesConfig.categories = safe.categories
  amenitiesConfig.cta = safe.cta
}

const assignImagePageConfig = (nextValue) => {
  const safe = sanitizeImagePageConfig(nextValue)
  pageImageConfig.pageKey = safe.pageKey
  pageImageConfig.heroImage = safe.heroImage
  pageImageConfig.images = safe.images
}

const fetchConfig = async () => {
  isLoading.value = true
  try {
    const { data } = await axios.get(`${API_BASE}/pages/${selectedPageKey.value}`)
    if (isAmenitiesPage.value) {
      assignAmenitiesConfig(data?.config)
    } else {
      assignImagePageConfig(data?.config)
    }
  } catch (error) {
    if (isAmenitiesPage.value) assignAmenitiesConfig(defaultAmenitiesConfig)
    else assignImagePageConfig(defaultImagePageConfig)
    showMessage(error?.response?.data?.message || 'Failed to load config', 'error')
  } finally {
    isLoading.value = false
  }
}

const saveConfig = async () => {
  isSaving.value = true
  try {
    const payload = isAmenitiesPage.value
      ? { config: sanitizeAmenitiesConfig(amenitiesConfig) }
      : { config: sanitizeImagePageConfig(pageImageConfig) }

    await axios.put(`${API_BASE}/pages/${selectedPageKey.value}`, payload)
    showMessage(`${selectedPageLabel.value} configuration saved`)
  } catch (error) {
    showMessage(error?.response?.data?.message || 'Failed to save config', 'error')
  } finally {
    isSaving.value = false
  }
}

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const uploadImageFile = async (file) => {
  const imageData = await fileToDataUrl(file)
  const { data } = await axios.post(`${API_BASE}/upload-image`, {
    imageData,
    fileName: file.name
  })
  if (!data?.success || !data?.url) throw new Error(data?.message || 'Upload failed')
  return data.url
}

const uploadAmenitiesHeroImage = async (event) => {
  const file = event.target?.files?.[0]
  if (!file) return

  isUploadingHero.value = true
  try {
    amenitiesConfig.hero.backgroundImage = await uploadImageFile(file)
    showMessage('Amenities hero image uploaded')
  } catch (error) {
    showMessage(error?.response?.data?.message || error.message || 'Failed to upload hero image', 'error')
  } finally {
    isUploadingHero.value = false
    event.target.value = ''
  }
}

const uploadGenericHeroImage = async (event) => {
  const file = event.target?.files?.[0]
  if (!file) return

  isUploadingHero.value = true
  try {
    pageImageConfig.heroImage = await uploadImageFile(file)
    showMessage(`${selectedPageLabel.value} hero image uploaded`)
  } catch (error) {
    showMessage(error?.response?.data?.message || error.message || 'Failed to upload hero image', 'error')
  } finally {
    isUploadingHero.value = false
    event.target.value = ''
  }
}

const makeImageKey = (cIndex, cardIndex, imgIndex) => `${cIndex}-${cardIndex}-${imgIndex}`

const setCardUploadRef = (cIndex, cardIndex, imgIndex) => (el) => {
  cardUploadRefs.value[makeImageKey(cIndex, cardIndex, imgIndex)] = el
}

const openCardImagePicker = (cIndex, cardIndex, imgIndex) => {
  const key = makeImageKey(cIndex, cardIndex, imgIndex)
  cardUploadRefs.value[key]?.click()
}

const isImageUploading = (cIndex, cardIndex, imgIndex) => Boolean(uploadingMap.value[makeImageKey(cIndex, cardIndex, imgIndex)])

const uploadCardImage = async (cIndex, cardIndex, imgIndex, event) => {
  const file = event.target?.files?.[0]
  if (!file) return

  const key = makeImageKey(cIndex, cardIndex, imgIndex)
  uploadingMap.value[key] = true
  try {
    amenitiesConfig.categories[cIndex].cards[cardIndex].images[imgIndex] = await uploadImageFile(file)
    showMessage('Card image uploaded')
  } catch (error) {
    showMessage(error?.response?.data?.message || error.message || 'Failed to upload card image', 'error')
  } finally {
    uploadingMap.value[key] = false
    event.target.value = ''
  }
}

const genericKey = (imgIndex) => `generic-${imgIndex}`

const setGenericUploadRef = (imgIndex) => (el) => {
  genericUploadRefs.value[genericKey(imgIndex)] = el
}

const openGenericImagePicker = (imgIndex) => {
  genericUploadRefs.value[genericKey(imgIndex)]?.click()
}

const isGenericUploading = (imgIndex) => Boolean(uploadingMap.value[genericKey(imgIndex)])

const uploadGenericImage = async (imgIndex, event) => {
  const file = event.target?.files?.[0]
  if (!file) return

  const key = genericKey(imgIndex)
  uploadingMap.value[key] = true
  try {
    pageImageConfig.images[imgIndex] = await uploadImageFile(file)
    showMessage(`${selectedPageLabel.value} image uploaded`)
  } catch (error) {
    showMessage(error?.response?.data?.message || error.message || 'Failed to upload image', 'error')
  } finally {
    uploadingMap.value[key] = false
    event.target.value = ''
  }
}

const addCategory = () => {
  amenitiesConfig.categories.push({
    id: `category-${amenitiesConfig.categories.length + 1}`,
    heading: 'New Category',
    listText: '',
    cards: []
  })
}

const removeCategory = (index) => {
  amenitiesConfig.categories.splice(index, 1)
}

const addCard = (cIndex) => {
  amenitiesConfig.categories[cIndex].cards.push({
    title: 'New Amenity',
    description: '',
    images: [''],
    bookable: false,
    buttonLink: '/reservation'
  })
}

const removeCard = (cIndex, cardIndex) => {
  amenitiesConfig.categories[cIndex].cards.splice(cardIndex, 1)
}

const addCardImage = (cIndex, cardIndex) => {
  amenitiesConfig.categories[cIndex].cards[cardIndex].images.push('')
}

const removeCardImage = (cIndex, cardIndex, imgIndex) => {
  amenitiesConfig.categories[cIndex].cards[cardIndex].images.splice(imgIndex, 1)
}

const addGenericImage = () => {
  pageImageConfig.images.push('')
}

const removeGenericImage = (imgIndex) => {
  pageImageConfig.images.splice(imgIndex, 1)
}

fetchConfig()
</script>

<style scoped>
.admin-page {
  --color-primary: #0369a1;
  --color-primary-light: #1f8dbf;
  --color-danger: #dc2626;
  --color-danger-dark: #b91c1c;
  --color-text: #1f2937;
  --color-muted: #6b7280;
  --color-border: #e5e7eb;
  --color-bg: #eef5fb;
  --color-white: #ffffff;
  min-height: 100vh;
  background: var(--color-bg);
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.main-content {
  margin-left: 0;
  padding-top: 60px;
}

@media (min-width: 768px) {
  .main-content { margin-left: 262px; }
}

.content-wrap {
  max-width: 1220px;
  margin: 0 auto;
  padding: 1rem 1.2rem 1.5rem;
  display: grid;
  gap: 1rem;
}

.toolbar {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 0.85rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.page-select-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.page-select-wrap span {
  color: var(--color-muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.page-select-wrap select {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0.45rem 0.6rem;
  font-size: 0.86rem;
  color: var(--color-text);
  background: var(--color-white);
}

.toolbar-status {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-muted);
  font-weight: 600;
  font-size: 0.9rem;
}

.status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #9ca3af;
}

.status-dot.live {
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.18);
}

.toolbar-actions {
  display: flex;
  gap: 0.5rem;
}

.panel {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 1rem;
  display: grid;
  gap: 0.8rem;
}

.panel-title {
  margin: 0;
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 800;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.section-head.compact {
  align-items: center;
}

.category-card,
.amenity-card-form {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.75rem;
  display: grid;
  gap: 0.65rem;
  background: #fbfdff;
}

.category-title,
.cards-title {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text);
  font-weight: 700;
}

.cards-head {
  margin-top: 0.3rem;
}

.grid {
  display: grid;
  gap: 0.65rem;
}

.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 768px) {
  .two-col { grid-template-columns: 1fr; }
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field span {
  font-size: 0.76rem;
  color: var(--color-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.field input[type='text'],
.field textarea {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.9rem;
  color: var(--color-text);
  background: var(--color-white);
  padding: 0.55rem 0.7rem;
}

.inline-field {
  grid-template-columns: 1fr auto;
  align-items: center;
}

.inline-field input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
}

.images-wrap {
  border: 1px dashed var(--color-border);
  border-radius: 10px;
  padding: 0.65rem;
  display: grid;
  gap: 0.45rem;
  background: var(--color-white);
}

.image-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.4rem;
}

@media (max-width: 768px) {
  .image-row { grid-template-columns: 1fr; }
}

.image-input {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.88rem;
  padding: 0.5rem 0.65rem;
}

.upload-row {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.upload-hint {
  font-size: 0.78rem;
  color: var(--color-muted);
}

.btn {
  border: none;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.48rem 0.8rem;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-ghost {
  background: #f3f4f6;
  color: var(--color-text);
}

.btn-ghost:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-light);
}

.btn-danger {
  background: var(--color-danger);
  color: var(--color-white);
}

.btn-danger:hover:not(:disabled) {
  background: var(--color-danger-dark);
}

.message {
  margin: 0;
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  font-size: 0.86rem;
  font-weight: 700;
}

.message-success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.message-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.hidden-input {
  display: none;
}
</style>
