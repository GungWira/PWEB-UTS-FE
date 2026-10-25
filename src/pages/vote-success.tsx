import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/context/auth-context'
import { BarChart3, CheckCircle2, LogOut, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function VoteSuccessPage() {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const candidateName = (location.state as { candidateName?: string } | null)?.candidateName

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-emerald-500/10 blur-[128px] dark:bg-emerald-600/15" />
            <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[40rem] w-[40rem] rounded-full bg-blue-500/10 blur-[128px] dark:bg-blue-600/15" />

            <header className="z-10 mx-auto flex w-full max-w-7xl items-center justify-end gap-3 px-6 py-6">
                <ThemeToggle />
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Keluar</span>
                </button>
            </header>

            <main className="z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="mx-auto w-fit rounded-3xl bg-emerald-500/10 p-5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>

                    <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Suara Berhasil Dikirim</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        Terima kasih telah menggunakan hak pilih Anda dalam Pemilihan Kepala Desa.
                    </p>

                    {candidateName && (
                        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                            <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">Pilihan Anda</p>
                            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{candidateName}</p>
                        </div>
                    )}

                    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left dark:border-emerald-900 dark:bg-emerald-950/40">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <p className="text-xs leading-relaxed text-emerald-700 dark:text-emerald-300">
                            Suara Anda disimpan secara anonim dan tidak dapat ditelusuri kembali ke identitas Anda.
                        </p>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <Link
                            to="/dashboard"
                            className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/live-count"
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                        >
                            <BarChart3 className="h-4 w-4" />
                            <span>Live Count</span>
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="z-10 mx-auto w-full max-w-7xl px-6 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} Panitia Pemilihan Kepala Desa Digital (E-Voting).
            </footer>
        </div>
    )
}
