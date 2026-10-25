import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth, type Voter } from '@/context/auth-context'
import { BarChart3, CheckCircle2, Clock, CreditCard, LogOut, MapPin, UserCircle2, Vote } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function DashboardPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const voter = user?.data as Voter

    const handleLogout = () => {
        logout()
        navigate('/login')
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
                        <h1 className="text-lg leading-none font-extrabold tracking-tight text-slate-900 dark:text-white">Dashboard Pemilih</h1>
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
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Keluar</span>
                    </button>
                </div>
            </header>

            <main className="z-10 mx-auto w-full max-w-2xl flex-1 px-6 py-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
                        <div className="rounded-2xl bg-blue-500/10 p-3.5 text-blue-600 dark:text-blue-400">
                            <UserCircle2 className="h-8 w-8" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">{voter.name}</h2>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Pemilih terdaftar dalam DPT</p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                            <CreditCard className="h-4 w-4 shrink-0 text-slate-400" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">NIK</p>
                                <p className="font-mono text-sm font-medium text-slate-800 dark:text-slate-200">{voter.nik}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">RT / RW</p>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{voter.rt_rw || '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                            {voter.has_voted ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                            ) : (
                                <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                            )}
                            <div>
                                <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">Status</p>
                                <span
                                    className={`mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                        voter.has_voted
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                    }`}
                                >
                                    {voter.has_voted ? 'Sudah Memilih' : 'Belum Memilih'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        {voter.has_voted ? (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
                                <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                                <p className="mt-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                    Terima kasih, suara Anda sudah tercatat
                                </p>
                                <p className="mt-0.5 text-xs text-emerald-600/80 dark:text-emerald-400/70">
                                    Hak pilih hanya dapat digunakan satu kali.
                                </p>
                            </div>
                        ) : (
                            <Link
                                to="/vote"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                            >
                                <Vote className="h-4 w-4" />
                                <span>Masuk Bilik Suara</span>
                            </Link>
                        )}
                    </div>
                </div>
            </main>

            <footer className="z-10 mx-auto w-full max-w-7xl px-6 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} Panitia Pemilihan Kepala Desa Digital (E-Voting).
            </footer>
        </div>
    )
}
