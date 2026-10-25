import { DatePicker } from '@/components/date-picker'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/context/auth-context'
import { getErrorMessage, getValidationErrors } from '@/lib/api'
import { BarChart3, CreditCard, Loader2, ShieldCheck, Vote } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

export default function LoginPage() {
    const { user, loginVoter } = useAuth()
    const navigate = useNavigate()

    const [nik, setNik] = useState('')
    const [birthDate, setBirthDate] = useState('')
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
            await loginVoter(nik, birthDate)
            navigate('/dashboard')
        } catch (error) {
            setErrors(getValidationErrors(error))
            setMessage(getErrorMessage(error, 'NIK atau Tanggal Lahir tidak terdaftar dalam DPT!'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 selection:bg-blue-500 selection:text-white dark:bg-slate-950 dark:text-slate-100">
            <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-blue-500/10 blur-[128px] dark:bg-blue-600/15" />
            <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[40rem] w-[40rem] rounded-full bg-indigo-500/10 blur-[128px] dark:bg-indigo-600/15" />

            <header className="z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-md">
                        <Vote className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-lg leading-none font-extrabold tracking-tight text-slate-900 dark:text-white">E-Voting Pilkades</h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Pemilihan Kepala Desa Digital</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <Link
                        to="/live-count"
                        className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400"
                    >
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Live Count</span>
                    </Link>
                </div>
            </header>

            <main className="z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Masuk Bilik Suara</h2>
                        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">Gunakan NIK dan tanggal lahir Anda</p>
                    </div>

                    {message && (
                        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs leading-relaxed text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">NIK (16 Digit)</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    maxLength={16}
                                    value={nik}
                                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Masukkan 16 digit NIK"
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 py-3 pr-4 pl-11 font-mono text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/60 dark:text-white dark:placeholder-slate-500"
                                />
                            </div>
                            {errors.nik && <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{errors.nik}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Tanggal Lahir</label>
                            <DatePicker
                                value={birthDate}
                                onChange={setBirthDate}
                                placeholder="Pilih tanggal lahir Anda"
                                required
                                invalid={Boolean(errors.birth_date)}
                            />
                            {errors.birth_date && <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{errors.birth_date}</p>}
                            <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">Sesuai tanggal lahir yang tercatat di DPT.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                            <span>{submitting ? 'Memeriksa data...' : 'Masuk'}</span>
                        </button>
                    </form>
                </div>
            </main>

            <footer className="z-10 mx-auto w-full max-w-7xl px-6 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} Panitia Pemilihan Kepala Desa Digital (E-Voting).
            </footer>
        </div>
    )
}
