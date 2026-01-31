<template>
  <div class="table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" :style="{ width: col.width }">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data" :key="row.id">
          <td v-for="col in columns" :key="col.key">
            <slot :name="col.key" :row="row">
              <template v-if="col.key === 'price'">
                ₱{{ row[col.key] }}
              </template>
              <template v-else-if="col.key === 'quantity'">
                {{ row.quantity }} {{ row.unit }}
              </template>
              <template v-else>
                {{ row[col.key] || '-' }}
              </template>
            </slot>
          </td>
        </tr>
        <tr v-if="data.length === 0">
          <td :colspan="columns.length" class="text-center">No data available.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  columns: Array,
  data: Array,
})
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.08);
  border: 1px solid #e2e8f0;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.data-table th,
.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

.data-table th {
  background: linear-gradient(135deg, #2B6CB0, #1e40af);
  color: white;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.85rem;
}

.data-table tbody tr {
  transition: all 0.2s ease;
}

.data-table tbody tr:hover {
  background: #f8fbff;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.text-center {
  text-align: center;
  color: #718096;
  padding: 2rem !important;
}
</style>
