import api, { TOKEN_KEY } from '@/lib/api'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const USER_KEY = 'pemira_user'

export interface Voter {
    id: string
    nik: string
    name: string
    birth_date: string | null
    rt_rw: string | null
    has_voted: boolean
}

export interface Admin {
    id: string
    name: string | null
    username: string
}

type AuthUser = { role: 'voter'; data: Voter } | { role: 'admin'; data: Admin }

interface AuthContextValue {
    user: AuthUser | null
    loading: boolean
    loginVoter: (nik: string, birthDate: string) => Promise<void>
    loginAdmin: (username: string, password: string) => Promise<void>
    logout: () => void
    refreshVoter: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY)

    if (!raw || !localStorage.getItem(TOKEN_KEY)) {
        return null
    }

    try {
        return JSON.parse(raw) as AuthUser
    } catch {
        return null
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(readStoredUser)
    const [loading, setLoading] = useState(true)

    // Pastikan token yang tersimpan masih berlaku di server.
    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY)

        if (!token) {
            setLoading(false)
            return
        }

        api.get('/auth/me')
            .then((response) => {
                const fresh = { role: response.data.role, data: response.data.user } as AuthUser
                setUser(fresh)
                localStorage.setItem(USER_KEY, JSON.stringify(fresh))
            })
            .catch(() => {
                localStorage.removeItem(TOKEN_KEY)
                localStorage.removeItem(USER_KEY)
                setUser(null)
            })
            .finally(() => setLoading(false))
    }, [])

    const store = (token: string, nextUser: AuthUser) => {
        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
        setUser(nextUser)
    }

    const loginVoter = async (nik: string, birthDate: string) => {
        const response = await api.post('/auth/voter/login', { nik, birth_date: birthDate })
        store(response.data.token, { role: 'voter', data: response.data.voter })
    }

    const loginAdmin = async (username: string, password: string) => {
        const response = await api.post('/auth/admin/login', { username, password })
        store(response.data.token, { role: 'admin', data: response.data.admin })
    }

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setUser(null)
    }

    const refreshVoter = async () => {
        const response = await api.get('/auth/me')
        const fresh = { role: response.data.role, data: response.data.user } as AuthUser
        setUser(fresh)
        localStorage.setItem(USER_KEY, JSON.stringify(fresh))
    }

    return <AuthContext.Provider value={{ user, loading, loginVoter, loginAdmin, logout, refreshVoter }}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth harus dipakai di dalam AuthProvider')
    }

    return context
}
