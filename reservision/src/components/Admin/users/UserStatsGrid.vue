<template>
  <div class="stats-section">
    <div class="stat-card">
      <div class="stat-icon blue">
        <i class="fas fa-users"></i>
      </div>
      <div class="stat-info">
        <h3>{{ stats.total }}</h3>
        <p>Total Users</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon green">
        <i class="fas fa-user-shield"></i>
      </div>
      <div class="stat-info">
        <h3>{{ stats.admins }}</h3>
        <p>Admins</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon orange">
        <i class="fas fa-user-tie"></i>
      </div>
      <div class="stat-info">
        <h3>{{ stats.staff }}</h3>
        <p>Staff</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon yellow">
        <i class="fas fa-user"></i>
      </div>
      <div class="stat-info">
        <h3>{{ stats.customers }}</h3>
        <p>Customers</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({ total: 0, admins: 0, staff: 0, customers: 0 })
  }
});
</script>

<style scoped>
.stats-section {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
  grid-template-columns: 1fr 1fr;
}

@media (min-width: 768px) {
  .stats-section {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(45, 74, 67, 0.08);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-icon {
  width: 3.125rem;
  height: 3.125rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.blue {
  background: rgba(125, 161, 142, 0.1);
  color: #63B3ED;
}

.stat-icon.green {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.stat-icon.orange {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.stat-icon.yellow {
  background: rgba(194, 166, 140, 0.1);
  color: #C2A68C;
}

.stat-info h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1A2E28;
}

.stat-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #6B8A7E;
}
</style>