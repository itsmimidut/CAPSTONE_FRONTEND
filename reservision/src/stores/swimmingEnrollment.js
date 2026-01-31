import { defineStore } from 'pinia'

const API_BASE_URL = 'http://localhost:8000/api/swimming'

export const useSwimmingEnrollmentStore = defineStore('swimmingEnrollment', {
    state: () => ({
        coaches: [],
        loading: false,
        error: '',
        submitting: false,
        submitError: ''
    }),
    actions: {
        setError(message) {
            this.error = message || ''
            this.submitError = message || ''
        },
        clearErrors() {
            this.error = ''
            this.submitError = ''
        },
        async fetchCoaches() {
            this.loading = true
            this.error = ''
            try {
                const response = await fetch(`${API_BASE_URL}/coaches`)
                if (!response.ok) {
                    throw new Error('Failed to fetch coaches')
                }
                this.coaches = await response.json()
            } catch (err) {
                this.error = err.message || 'Failed to fetch coaches'
            } finally {
                this.loading = false
            }
        },
        async submitEnrollment(payload) {
            this.submitting = true
            this.submitError = ''
            try {
                const response = await fetch(`${API_BASE_URL}/enrollments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data?.error || 'Failed to submit enrollment')
                }

                return data
            } catch (err) {
                this.submitError = err.message || 'Failed to submit enrollment'
                return null
            } finally {
                this.submitting = false
            }
        }
    }
})