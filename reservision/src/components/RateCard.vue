<template>
  <div class="rate-card">
    <!-- Image/Icon Header -->
    <div class="card-header" :style="{ backgroundImage: image ? `url(${image})` : 'none' }">
      <div v-if="!image" class="img-placeholder">
        <i :class="icon"></i>
        <p>{{ title }}</p>
      </div>
      <div v-else class="overlay"></div>
    </div>

    <!-- Content -->
    <div class="card-content">
      <h4 class="card-title">{{ title }}</h4>
      
      <!-- Price (if single price) -->
      <div v-if="price" class="price-tag">
        {{ price }}
      </div>
      
      <!-- Capacity -->
      <p v-if="capacity" class="capacity">
        <i class="fas fa-users mr-1"></i>{{ capacity }}
      </p>

      <!-- Features List -->
      <ul v-if="features && features.length > 0" class="features">
        <li v-for="(feature, index) in features" :key="index">
          <i class="fas fa-check-circle text-primary-blue mr-2"></i>{{ feature }}
        </li>
      </ul>

      <!-- Table (for multiple rates) -->
      <table v-if="tableData && tableData.length > 0" class="rate-table">
        <thead>
          <tr>
            <th>{{ tableHeaders[0] }}</th>
            <th>{{ tableHeaders[1] }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in tableData" :key="index">
            <td>{{ row.label }}</td>
            <td class="font-semibold text-warm-brown">{{ row.value }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Note -->
      <p v-if="note" class="note">
        <i class="fas fa-info-circle mr-1"></i>{{ note }}
      </p>

      <!-- CTA Button -->
      <a :href="ctaLink" class="cta-btn">
        <i :class="ctaIcon"></i> {{ ctaText }}
      </a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  price: String,
  capacity: String,
  features: Array,
  tableData: Array,
  tableHeaders: {
    type: Array,
    default: () => ['Type', 'Rate']
  },
  note: String,
  ctaText: {
    type: String,
    default: 'Book Now'
  },
  ctaLink: {
    type: String,
    default: '/reservation'
  },
  ctaIcon: {
    type: String,
    default: 'fas fa-calendar-check'
  },
  icon: {
    type: String,
    default: 'fas fa-home'
  },
  image: String
})
</script>

<style scoped>
.rate-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.rate-card:hover {
  box-shadow: 0 12px 28px rgba(0,0,0,0.15);
  transform: translateY(-8px);
}

.card-header {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.3));
}

.img-placeholder {
  height: 100%;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.img-placeholder i {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  color: #2B6CB0;
  opacity: 0.7;
}

.img-placeholder p {
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-content {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2D3748;
  margin-bottom: 1rem;
}

.price-tag {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #C19A6B, #8B5E3C);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.75rem;
}

.capacity {
  font-size: 0.95rem;
  color: #718096;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border-radius: 8px;
  display: inline-block;
}

.features {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  flex-grow: 1;
}

.features li {
  padding: 0.5rem 0;
  font-size: 0.95rem;
  color: #4a5568;
  display: flex;
  align-items: flex-start;
}

.rate-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.95rem;
  flex-grow: 1;
}

.rate-table th,
.rate-table td {
  padding: 0.875rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.rate-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #2D3748;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rate-table tr:hover {
  background: #f8fafc;
}

.note {
  font-size: 0.8rem;
  color: #718096;
  margin: 1rem 0;
  padding: 0.75rem;
  background: #fef3c7;
  border-left: 3px solid #f59e0b;
  border-radius: 4px;
}

.cta-btn {
  margin-top: auto;
  background: linear-gradient(135deg, #2B6CB0, #1e40af);
  color: white;
  padding: 0.875rem 1.5rem;
  border-radius: 50px;
  text-align: center;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.cta-btn:hover {
  background: linear-gradient(135deg, #1e40af, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(43, 108, 176, 0.4);
}

@media (max-width: 640px) {
  .card-header {
    height: 160px;
  }
  
  .card-title {
    font-size: 1.25rem;
  }
  
  .price-tag {
    font-size: 1.75rem;
  }
}
</style>