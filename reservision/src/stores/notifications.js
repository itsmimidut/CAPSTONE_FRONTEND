import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
    // Initialize from localStorage or defaults
    const storedData = localStorage.getItem('notificationCounts')
    const parsed = storedData ? JSON.parse(storedData) : {}

    const swimmingPendingCount = ref(parsed.swimming || 0)
    const reservationPendingCount = ref(parsed.reservation || 0)
    const eshopPendingCount = ref(parsed.eshop || 0)

    const hasAnyNotifications = computed(() =>
        swimmingPendingCount.value > 0 ||
        reservationPendingCount.value > 0 ||
        eshopPendingCount.value > 0
    )

    // Watch for changes and persist to localStorage
    watch(
        () => ({
            swimming: swimmingPendingCount.value,
            reservation: reservationPendingCount.value,
            eshop: eshopPendingCount.value
        }),
        (newValues) => {
            localStorage.setItem('notificationCounts', JSON.stringify(newValues))
        },
        { deep: true }
    )

    function setSwimmingPending(count) {
        swimmingPendingCount.value = count
    }

    function setReservationPending(count) {
        reservationPendingCount.value = count
    }

    function setEshopPending(count) {
        eshopPendingCount.value = count
    }

    return {
        swimmingPendingCount,
        reservationPendingCount,
        eshopPendingCount,
        hasAnyNotifications,
        setSwimmingPending,
        setReservationPending,
        setEshopPending
    }
})
