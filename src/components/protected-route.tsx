import { useAuth } from '@/context/auth-context'
import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
    role: 'voter' | 'admin'
    children: ReactNode
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace />
    }

    if (user.role !== role) {
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
    }

    return <>{children}</>
}
