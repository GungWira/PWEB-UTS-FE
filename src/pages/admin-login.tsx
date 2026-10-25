import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/context/auth-context'
import { getErrorMessage, getValidationErrors } from '@/lib/api'
import { KeyRound, Loader2, ShieldAlert, User } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

export default function AdminLoginPage() {
    const { user, loginAdmin } = useAuth()
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)

    if (user) {
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})
        setMessage('')
        setSubmitting(true)

        try {
            await loginAdmin(username, password)
            navigate('/admin/dashboard')
        } catch (error) {
            setErrors(getValidationErrors(error))
            setMessage(getErrorMessage(error, 'Username atau Password salah!'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <header className="mx-auto flex w-full max-w-7xl items-center justify-end px-6 py-6">
                <ThemeToggle />
            </header>

            <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-6 text-center">
                        <div className="mx-auto w-fit rounded-2xl bg-blue-600 p-3 text-white shadow-md">
                            <ShieldAlert className="h-7 w-7" />
                        </div>
                        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Panel Admin</h2>
                        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">Panitia Pemilihan Kepala Desa</p>
                    </div>

                    {message && (
                        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs leading-relaxed text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Username</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                                    <User className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 py-3 pr-4 pl-11 text-sm text-slate-900 transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/60 dark:text-white"
                                />
                            </div>
                            {errors.username && <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{errors.username}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Password</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                                    <KeyRound className="h-5 w-5" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 py-3 pr-4 pl-11 text-sm text-slate-900 transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/60 dark:text-white"
                                />
                            </div>
                            {errors.password && <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:opacity-50"
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            <span>{submitting ? 'Memeriksa...' : 'Masuk Panel Admin'}</span>
                        </button>
                    </form>

                    <div className="mt-6 border-t border-slate-200 pt-4 text-center dark:border-slate-800">
                        <Link
                            to="/login"
                            className="text-xs font-semibold text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                        >
                            Masuk sebagai Pemilih
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="mx-auto w-full max-w-7xl px-6 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} Panitia Pemilihan Kepala Desa Digital (E-Voting Admin).
            </footer>
        </div>
    )
}
