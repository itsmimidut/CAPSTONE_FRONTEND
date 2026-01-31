<template>
  <div v-show="show" class="modal show">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ room?.id ? 'Edit Room' : 'Add New Room' }}</h3>
        <button class="close-modal" @click="$emit('update:show', false)">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Room Number</label>
          <input type="text" v-model="form.room_number" class="form-control" />
        </div>
        <div class="form-group">
          <label>Room Name</label>
          <input type="text" v-model="form.name" class="form-control" />
        </div>
        <div class="form-group">
          <label>Category</label>
          <select v-model="form.category" class="form-control">
            <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        <div class="form-group" v-if="availableTypes.length">
          <label>Type</label>
          <select v-model="form.type" class="form-control">
            <option v-for="type in availableTypes" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Capacity</label>
          <input type="number" v-model="form.max_guests" class="form-control" />
        </div>
        <div class="form-group">
          <label>Price</label>
          <input type="number" v-model="form.price" class="form-control" />
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.description" class="form-control"></textarea>
        </div>

        <!-- Image Upload -->
        <div class="form-group">
          <label>Images</label>
          <input type="file" multiple @change="handleFiles" class="form-control" />
          <div class="grid grid-cols-3 gap-2 mt-2">
            <div v-for="(img, index) in form.images" :key="index" class="relative">
              <img :src="img" class="w-full h-24 object-cover rounded" />
              <button @click="removeImage(index)" class="absolute top-1 right-1 bg-red-600 text-white rounded-full px-1 text-xs">×</button>
              <button @click="setPrimary(index)" class="absolute bottom-1 left-1 bg-yellow-400 text-white rounded-full px-1 text-xs">★</button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer flex gap-2 justify-end">
        <button class="btn btn-outline" @click="$emit('update:show', false)">Cancel</button>
        <button class="btn btn-primary" @click="save">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'
const props = defineProps({
  show: Boolean,
  room: Object,
  // Optional override so parent page can control categories (e.g., rooms vs cottages)
  categoryOptions: {
    type: Array,
    default: () => []
  },
  defaultCategory: {
    type: String,
    default: ''
  },
  // Optional map of type options per category
  categoryTypeMap: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['update:show', 'save'])

const form = reactive({
  id: null,
  room_number: '',
  name: '',
  category: '',
  type: '',
  max_guests: 2,
  price: 0,
  description: '',
  status: 'Available',
  promo: false,
  images: [],
  primaryImageIndex: 0
})

// Determine available categories (parent overrides fallback)
const fallbackCategories = ['Standard Room', 'Suite', 'Cottage', 'Deluxe Room']
const availableCategories = computed(() => props.categoryOptions.length ? props.categoryOptions : fallbackCategories)

// Type options dependent on category (fallback defaults informed by brochure)
const fallbackTypeMap = {
  'Cottage': [
    'Front View',
    'Fountain View',
    'Pool Side',
    'Waterpark Side',
    'Left Corner',
    'KTV Room',
    'Court View'
  ],
  'Deluxe Room': ['Deluxe Type 1 (Queen + Pull-Out)', 'Deluxe Type 2 (Single + Twin)'],
  'Family Room': ['Family Room'],
  'Studio Room': ['Studio Room']
}
const availableTypes = computed(() => {
  const map = Object.keys(props.categoryTypeMap).length ? props.categoryTypeMap : fallbackTypeMap
  return map[form.category] || []
})

// Helper to set the category based on defaults
const setCategoryDefault = () => {
  form.category = props.defaultCategory || availableCategories.value[0] || ''
}

const setTypeDefault = () => {
  const types = availableTypes.value
  if (types.length) {
    form.type = types[0]
  } else {
    form.type = ''
  }
}

// Watch props to update form
watch(() => props.room, (val) => {
  if (val) {
    Object.assign(form, val)
  } else {
    Object.assign(form, {
      id: null, room_number: '', name: '', category: 'Standard Room',
      type: '',
      max_guests: 2, price: 0, description: '', status: 'Available',
      promo: false, images: [], primaryImageIndex: 0
    })
  }
}, { immediate: true })

// When categories or defaults change, update the form category if none set
watch(() => [props.categoryOptions, props.defaultCategory], () => {
  if (!form.category) {
    setCategoryDefault()
  }
  setTypeDefault()
}, { immediate: true })

// Update type when category changes
watch(() => form.category, () => {
  setTypeDefault()
})

const handleFiles = (e) => {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = () => form.images.push(reader.result)
    reader.readAsDataURL(file)
  })
}

const removeImage = (index) => {
  form.images.splice(index, 1)
  if (form.primaryImageIndex >= index) {
    form.primaryImageIndex = Math.max(0, form.primaryImageIndex - 1)
  }
}

const setPrimary = (index) => {
  form.primaryImageIndex = index
}

const save = () => {
  if (!form.name || !form.price || !form.room_number || form.images.length === 0) {
    alert('Please fill all required fields and upload at least one image!')
    return
  }
  emit('save', { ...form })
}
</script>
