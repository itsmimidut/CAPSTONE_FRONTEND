<template>
  <div class="customer-layout">
    <CustomerSidebar
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      :items="menuItems"
      :active-section="activeSection"
      brand="Reservision"
      :user-name="customerName"
      user-role="Customer"
      @select="setActiveSection"
      @close="sidebarOpen = false"
    />

    <main class="main-content" :class="{ shifted: sidebarCollapsed }">
      <div class="header-container">
        <AdminHeader
          :title="headerTitle"
          :subtitle="headerSubtitle"
          :user-name="customerName"
          @toggle-sidebar="sidebarOpen = !sidebarOpen"
        />
      </div>

      <div style="margin:0; padding:0; position:relative;">
        <ReservationSection
          v-show="activeSection === 'book'"
        />
      </div>

      <div class="content-wrapper">
        <div v-if="loadError" class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ loadError }}
        </div>
        <CustomerDashboardSection
          v-show="activeSection === 'dashboard'"
          :summary-cards="summaryCards"
          :recent-activity="recentActivity"
          :recommended-rooms="recommendedRooms"
          :customer-name="customerName"
        />

        <CustomerReservationsSection
          v-show="activeSection === 'reservations'" class=""
          :reservations="reservations"
        />

        <CustomerEsop
          v-show="activeSection === 'esop'"
        />

        <OrderHistory
          v-show="activeSection === 'orders'"
          :show-header="false"
          @close="() => {}"
        />

        <CustomerProfileSection
          v-show="activeSection === 'profile'"
          :profile="profile"
        />

        <CustomerSupportSection
          v-show="activeSection === 'support'"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import AdminHeader from '../../components/admin/AdminHeader.vue';
import CustomerSidebar from '../../components/Customer/CustomerSidebar.vue';
import CustomerDashboardSection from '../../components/Customer/CustomerDashboardSection.vue';
import ReservationSection from '../../components/Customer/ReservationSection.vue';
import CustomerReservationsSection from '../../components/Customer/CustomerReservationsSection.vue';
import CustomerProfileSection from '../../components/Customer/CustomerProfileSection.vue';
import CustomerSupportSection from '../../components/Customer/CustomerSupportSection.vue';
import CustomerEsop from '../../components/Customer/ResortEShop.vue';
import OrderHistory from '../../components/Customer/OrderHistory.vue';

const apiBase = 'http://localhost:8000/api';
const auth = useAuthStore();

const activeSection = ref('dashboard');

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-home' },
  { id: 'book', label: 'Book a Room', icon: 'fa-bed' },
  { id: 'reservations', label: 'My Reservations', icon: 'fa-calendar-alt' },
  { id: 'esop', label: 'Resort E-Shop', icon: 'fa-shopping-cart' },
  { id: 'orders', label: 'My Orders', icon: 'fa-receipt' },
  { id: 'profile', label: 'Profile', icon: 'fa-user' },
  // { id: 'support', label: 'Support', icon: 'fa-headset' }
];

const summaryCards = ref([]);
const recentActivity = ref([]);
const recommendedRooms = ref([]);
const bookRooms = ref([]);
const reservations = ref([]);
const isLoading = ref(false);
const loadError = ref('');

const customerName = computed(() => auth.user?.name || 'Guest');
const customerEmail = computed(() => auth.user?.email || '');

const headerTitle = computed(() => {
  const titles = {
    dashboard: 'Customer Dashboard',
    book: 'Book a Room',
    reservations: 'My Reservations',
    esop: 'Resort E-Shop',
    orders: 'My Orders',
    profile: 'Profile Settings',
    support: 'Support & Help'
  };
  return titles[activeSection.value] || 'Customer Dashboard';
});

const headerSubtitle = computed(() => {
  if (activeSection.value === 'dashboard') {
    return `Welcome back, ${customerName.value}`;
  }
  const subtitles = {
    book: 'Find and book your perfect stay',
    reservations: 'View and manage your bookings',
    esop: 'Shop resort merchandise and amenities',
    orders: 'View your order history and track deliveries',
    profile: 'Manage your account information',
    support: 'Get help and submit requests'
  };
  return subtitles[activeSection.value] || '';
});

const profile = ref({
  fullName: 'Guest',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  postalCode: '',
  profileImage: '',
});

const sidebarOpen = ref(false);
const sidebarCollapsed = ref(false);

const setActiveSection = (sectionId) => {
  activeSection.value = sectionId;
};

const viewReservations = () => {
  activeSection.value = 'reservations';
};

const formatDate = (value) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const statusClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('confirm')) {
    return 'text-green-600 font-semibold';
  }
  if (normalized.includes('pending')) {
    return 'text-yellow-600 font-semibold';
  }
  if (normalized.includes('cancel')) {
    return 'text-red-600 font-semibold';
  }
  return 'text-blue-600 font-semibold';
};

const parseImages = (value) => {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const buildSummaryCards = (bookings) => {
  const now = new Date();
  const upcoming = bookings.find((booking) => new Date(booking.check_in_date) > now);
  const upcomingNights = upcoming
    ? Math.max(1, Math.round((new Date(upcoming.check_out_date) - new Date(upcoming.check_in_date)) / 86400000))
    : 0;
  const loyaltyPoints = bookings.length * 50;

  summaryCards.value = [
    { title: 'Upcoming Stay', value: `${upcomingNights} Nights`, tone: 'blue' },
    { title: 'Total Bookings', value: String(bookings.length), tone: 'green' },
    { title: 'Loyalty Points', value: String(loyaltyPoints), tone: 'orange' },
    { title: 'Unread Messages', value: '0', tone: 'yellow' },
  ];
};

const mapRecentActivity = (bookings) => {
  recentActivity.value = bookings.slice(0, 5).map((booking) => ({
    date: formatDate(booking.created_at || booking.check_in_date),
    activity: booking.items_summary || 'Booking created',
    status: booking.booking_status || 'Pending',
    statusClass: statusClass(booking.booking_status),
  }));
};

const mapReservations = (bookings) => {
  reservations.value = bookings.map((booking) => ({
    roomType: booking.items_summary || 'Room Booking',
    checkIn: formatDate(booking.check_in_date),
    checkOut: formatDate(booking.check_out_date),
    status: booking.booking_status || 'Pending',
    statusClass: statusClass(booking.booking_status),
  }));
};

const fetchBookings = async () => {
  if (!customerEmail.value) {
    return [];
  }
  const response = await fetch(`${apiBase}/bookings?email=${encodeURIComponent(customerEmail.value)}`);
  if (!response.ok) {
    throw new Error('Failed to load bookings');
  }
  const payload = await response.json();
  return payload.data || [];
};

const fetchRooms = async () => {
  const response = await fetch(`${apiBase}/rooms`);
  if (!response.ok) {
    throw new Error('Failed to load rooms');
  }
  const rooms = await response.json();
  return Array.isArray(rooms) ? rooms : [];
};

const fetchCustomerProfile = async () => {
  if (!customerEmail.value) {
    return null;
  }
  const response = await fetch(`${apiBase}/customers/profile/${encodeURIComponent(customerEmail.value)}`);
  if (!response.ok) {
    return null;
  }
  const payload = await response.json();
  return payload.customer || null;
};

const loadDashboardData = async () => {
  isLoading.value = true;
  loadError.value = '';
  try {
    const [bookings, rooms, customerProfile] = await Promise.all([
      fetchBookings(),
      fetchRooms(),
      fetchCustomerProfile(),
    ]);

    buildSummaryCards(bookings);
    mapRecentActivity(bookings);
    mapReservations(bookings);

    const availableRooms = rooms.filter((room) => String(room.status || '').toLowerCase() === 'available');
    const mappedRooms = availableRooms.slice(0, 6).map((room) => {
      const images = parseImages(room.images);
      const imageUrl = images[room.primaryImageIndex] || images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60';
      return {
        title: room.name,
        price: `PHP ${Number(room.price || 0).toLocaleString()} / night`,
        imageUrl,
      };
    });

    recommendedRooms.value = mappedRooms.slice(0, 3);
    bookRooms.value = mappedRooms;

    if (customerProfile) {
      profile.value = {
        fullName: `${customerProfile.firstName || ''} ${customerProfile.lastName || ''}`.trim() || customerName.value,
        email: customerProfile.email || customerEmail.value,
        phone: customerProfile.phone || '',
        address: customerProfile.address || '',
        city: customerProfile.city || '',
        country: customerProfile.country || '',
        postalCode: customerProfile.postalCode || '',
        profileImage: customerProfile.profileImage || '',
      };
    } else {
      profile.value = {
        fullName: customerName.value,
        email: customerEmail.value,
        phone: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
        profileImage: '',
      };
    }
  } catch (error) {
    loadError.value = error?.message || 'Failed to load dashboard data';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // Set activeSection from query param if present
  const sectionParam =
    (typeof window !== 'undefined' && window.location.search)
      ? (new URLSearchParams(window.location.search).get('section') || new URLSearchParams(window.location.search).get('ActiveSection'))
      : null;
  if (sectionParam) {
    activeSection.value = sectionParam;
  }
  loadDashboardData();
});
</script>

<style scoped>
.customer-layout {
  min-height: 100vh;
  background: linear-gradient(to bottom, #F8F7F4, #FFFFFF);
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
}

@media (min-width: 768px) {
  .customer-layout {
    grid-template-columns: 260px 1fr;
    grid-template-rows: 1fr;
  }
}

.customer-layout > :nth-child(1) {
  grid-column: 1;
  grid-row: 1;
  z-index: 30;
}

@media (min-width: 768px) {
  .customer-layout > :nth-child(1) {
    grid-row: 1 / -1;
  }
}

.main-content {
  margin-left: 0;
  min-height: 100vh;
  background-color: #F8F7F4;
  transition: margin-left 0.3s ease;
  padding: 0.75rem;
  grid-column: 1;
  grid-row: 2;
  display: flex;
  flex-direction: column;
}

.header-container {
  padding: 1rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  top: 0;
  z-index: 50;
  margin-bottom: 10px;
}


.content-wrapper {
  padding-top: 1.5rem;
}

@media (min-width: 768px) {
  .main-content {
    grid-column: 2;
    grid-row: 1;
    padding: 1.5rem;
  }

  .main-content.shifted {
    grid-column: 2;
  }

  .content-wrapper {
    padding-top: 4.5rem;
  }
}
</style>