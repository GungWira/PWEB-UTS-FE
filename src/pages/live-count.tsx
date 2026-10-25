import { ThemeToggle } from '@/components/theme-toggle'
import api, { getErrorMessage } from '@/lib/api'
import { ArrowLeft, BarChart3, CheckCircle2, Clock, Loader2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface ChartRow {
    id: string
    candidate_number: string
    name: string
    votes: number
}

interface Stats {
    total_dpt: number
    total_voted: number
    total_unvoted: number
    percentage: number
}

const BAR_COLORS = ['#2563eb', '#4f46e5', '#0891b2', '#7c3aed', '#0d9488']

export default function LiveCountPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [chartData, setChartData] = useState<ChartRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const load = () => {
            api.get('/live-count')
                .then((response) => {
                    setStats(response.data.stats)
                    setChartData(response.data.candidates)
                    setError('')
                })
                .catch((err) => setError(getErrorMessage(err, 'Gagal memuat data perolehan suara.')))
                .finally(() => setLoading(false))
        }

        load()

        const timer = setInterval(load, 10000)

        return () => clearInterval(timer)
    }, [])

    const totalVotes = chartData.reduce((sum, row) => sum + row.votes, 0)

    return (
        <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <header className="mx-auto flex w-full max-w-7xl items-center justify-between border-b border-slate-200 px-6 py-6 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-lg leading-none font-extrabold tracking-tight text-slate-900 dark:text-white">Live Count</h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Perolehan suara diperbarui tiap 10 detik</p>
                    </div>
                </div>

                <ThemeToggle />
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-6 py-8">
                {error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                    </div>
                )}

                {stats && (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-600 dark:text-blue-400">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">Total DPT</p>
                                    <h3 className="mt-0.5 text-2xl font-black text-slate-900 dark:text-white">{stats.total_dpt}</h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">Sudah Memilih</p>
                                    <h3 className="mt-0.5 text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.total_voted}</h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">Belum Memilih</p>
                                    <h3 className="mt-0.5 text-2xl font-black text-amber-600 dark:text-amber-400">{stats.total_unvoted}</h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-400">
                                    <BarChart3 className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">Partisipasi</p>
                                    <h3 className="mt-0.5 text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats.percentage}%</h3>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Perolehan Suara per Paslon</h2>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Total {totalVotes} suara masuk</p>

                            {chartData.length === 0 ? (
                                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada data paslon.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="mt-6 h-72 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
                                                <XAxis
                                                    dataKey="candidate_number"
                                                    tickFormatter={(value) => `No. ${value}`}
                                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    allowDecimals={false}
                                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        borderRadius: '0.75rem',
                                                        border: '1px solid #e2e8f0',
                                                        fontSize: '12px',
                                                    }}
                                                />
                                                <Bar dataKey="votes" name="Suara" radius={[8, 8, 0, 0]}>
                                                    {chartData.map((row, index) => (
                                                        <Cell key={row.id} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        {chartData.map((row, index) => {
                                            const share = totalVotes > 0 ? Math.round((row.votes / totalVotes) * 100) : 0

                                            return (
                                                <div
                                                    key={row.id}
                                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-extrabold text-white">
                                                                {row.candidate_number}
                                                            </span>
                                                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{row.name}</p>
                                                        </div>
                                                        <div className="shrink-0 text-right">
                                                            <span className="text-xl font-black text-slate-900 dark:text-white">{row.votes}</span>
                                                            <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">({share}%)</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{ width: `${share}%`, backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </main>

            <footer className="mx-auto w-full max-w-7xl px-6 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} Panitia Pemilihan Kepala Desa Digital (E-Voting).
            </footer>
        </div>
    )
}
