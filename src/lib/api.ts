import axios from 'axios'

export const TOKEN_KEY = 'pemira_token'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
    headers: {
        Accept: 'application/json',
    },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem('pemira_user')
        }

        return Promise.reject(error)
    },
)

export function getErrorMessage(error: unknown, fallback = 'Terjadi kesalahan. Silakan coba lagi.') {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message ?? fallback
    }

    return fallback
}

export function getValidationErrors(error: unknown): Record<string, string> {
    if (!axios.isAxiosError(error)) {
        return {}
    }

    const errors = error.response?.data?.errors as Record<string, string[]> | undefined

    if (!errors) {
        return {}
    }

    const flat: Record<string, string> = {}

    for (const field in errors) {
        flat[field] = errors[field][0]
    }

    return flat
}

export default api
