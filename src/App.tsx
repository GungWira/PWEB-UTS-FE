import { ProtectedRoute } from '@/components/protected-route'
import AdminDashboardPage from '@/pages/admin-dashboard'
import AdminLoginPage from '@/pages/admin-login'
import DashboardPage from '@/pages/dashboard'
import LiveCountPage from '@/pages/live-count'
import LoginPage from '@/pages/login'
import VotePage from '@/pages/vote'
import VoteSuccessPage from '@/pages/vote-success'
import { Navigate, Route, Routes } from 'react-router-dom'

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/live-count" element={<LiveCountPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute role="voter">
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/vote"
                element={
                    <ProtectedRoute role="voter">
                        <VotePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/vote/success"
                element={
                    <ProtectedRoute role="voter">
                        <VoteSuccessPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute role="admin">
                        <AdminDashboardPage />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}
