import { CandidateModal, type Candidate } from '@/components/candidate-modal'
import { ConfirmModal } from '@/components/confirm-modal'
import { DatePicker } from '@/components/date-picker'
import { ImportDptModal } from '@/components/import-dpt-modal'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/context/auth-context'
import api, { getErrorMessage, getValidationErrors } from '@/lib/api'
import {
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    ListChecks,
    Loader2,
    LogOut,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    ShieldAlert,
    Trash2,
    Trash2 as TrashIcon,
    UserCheck,
    Users,
    Vote,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface Voter {
    id: string
    nik: string
    name: string
    birth_date: string | null
    rt_rw: string | null
    has_voted: boolean
}

interface Stats {
    total_dpt: number
    total_voted: number
    total_unvoted: number
    total_candidates: number
}

type PendingAction =
    { type: 'delete-voter'; id: string } | { type: 'reset-voter'; id: string } | { type: 'delete-candidate'; id: string } | { type: 'reset-election' }

export default function AdminDashboardPage() {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const [stats, setStats] = useState<Stats | null>(null)
    const [voters, setVoters] = useState<Voter[]>([])
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [loading, setLoading] = useState(true)
    const [notice, setNotice] = useState('')
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    const [isAddVoterOpen, setIsAddVoterOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [candidateModal, setCandidateModal] = useState<{
        open: boolean
        candidate: Candidate | null
    }>({ open: false, candidate: null })
    const [pending, setPending] = useState<PendingAction | null>(null)

    const [newVoter, setNewVoter] = useState({
        nik: '',
        name: '',
        birth_date: '',
        rt_rw: '',
    })
    const [voterErrors, setVoterErrors] = useState<Record<string, string>>({})
    const [savingVoter, setSavingVoter] = useState(false)

    const loadDashboard = () => {
        return api
            .get('/admin/dashboard')
            .then((response) => {
                setStats(response.data.stats)
                setVoters(response.data.voters)
                setCandidates(response.data.candidates)
                setError('')
            })
            .catch((err) => setError(getErrorMessage(err, 'Gagal memuat data dashboard.')))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadDashboard()
    }, [])

    const showNotice = (message: string) => {
        setNotice(message)
        setTimeout(() => setNotice(''), 5000)
    }

    const handleLogout = () => {
        logout()
        navigate('/admin/login')
    }

    const handleAddVoter = async (e: React.FormEvent) => {
        e.preventDefault()
        setVoterErrors({})
        setSavingVoter(true)

        try {
            await api.post('/admin/voters', newVoter)
            setNewVoter({ nik: '', name: '', birth_date: '', rt_rw: '' })
            setIsAddVoterOpen(false)
            await loadDashboard()
            showNotice('Pemilih berhasil ditambahkan.')
        } catch (err) {
            setVoterErrors(getValidationErrors(err))
        } finally {
            setSavingVoter(false)
        }
    }

    const handleConfirmAction = async () => {
        if (!pending) return

        const action = pending
        setPending(null)

        try {
            if (action.type === 'delete-voter') {
                await api.delete(`/admin/voters/${action.id}`)
                showNotice('Data pemilih berhasil dihapus.')
            } else if (action.type === 'reset-voter') {
                await api.post(`/admin/voters/${action.id}/reset`)
                showNotice('Status voting pemilih berhasil direset.')
            } else if (action.type === 'delete-candidate') {
                await api.delete(`/admin/candidates/${action.id}`)
                showNotice('Paslon berhasil dihapus.')
            } else {
                await api.post('/admin/reset-election')
                showNotice('Data hasil pemilihan berhasil direset total.')
            }

            await loadDashboard()
        } catch (err) {
            setError(getErrorMessage(err, 'Tindakan gagal dijalankan.'))
        }
    }

    const confirmDialog = () => {
        if (!pending) return null

        const config = {
            'delete-voter': {
                title: 'Hapus Pemilih (DPT)',
                message: 'Apakah Anda yakin ingin menghapus data pemilih ini dari daftar DPT?',
                tone: 'danger' as const,
            },
            'reset-voter': {
                title: 'Reset Status Voting',
                message: 'Apakah Anda yakin ingin mereset status voting pemilih ini agar dapat mencoblos kembali?',
                tone: 'warning' as const,
            },
            'delete-candidate': {
                title: 'Hapus Pasangan Calon',
                message: 'Menghapus paslon juga akan menghapus seluruh suara yang masuk untuk paslon ini. Yakin ingin melanjutkan?',
                tone: 'danger' as const,
            },
            'reset-election': {
                title: 'PERINGATAN: Reset Total Pemilihan',
                message: 'Tindakan ini akan MENGHAPUS SELURUH suara yang masuk dan MERESET status seluruh DPT. Yakin ingin melanjutkan?',
                tone: 'danger' as const,
            },
        }[pending.type]

        return <ConfirmModal {...config} onCancel={() => setPending(null)} onConfirm={handleConfirmAction} />
    }

    const filteredVoters = voters.filter((v) => v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.nik.includes(searchTerm))

    return (
        <div className="relative flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900 transition-colors duration-300 selection:bg-blue-500 selection:text-white dark:bg-slate-950 dark:text-slate-100">
            <header className="mx-auto flex w-full max-w-7xl items-center justify-between border-b border-slate-200 px-6 py-6 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-md">
                        <Vote className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-lg leading-none font-extrabold tracking-tight text-slate-900 dark:text-white">Panel Admin PEMIRA</h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Manajemen DPT &amp; Kontrol Pemilihan</p>
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
                        onClick={() => setPending({ type: 'reset-election' })}
                        className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400"
                    >
                        <ShieldAlert className="h-4 w-4" />
                        <span className="hidden sm:inline">Reset Pemilihan</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Keluar</span>
                    </button>
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-6 py-8">
                {notice && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {notice}
                    </div>
                )}

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
                                <UserCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">Total Paslon</p>
                                <h3 className="mt-0.5 text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats.total_candidates}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manajemen Pasangan Calon</h2>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Kelola paslon dan pantau perolehan suara</p>
                            </div>
                            <button
                                onClick={() => setCandidateModal({ open: true, candidate: null })}
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Tambah Paslon</span>
                            </button>
                        </div>

                        {candidates.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-950">
                                <UserCheck className="mx-auto h-8 w-8 text-slate-400" />
                                <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">Belum ada pasangan calon</p>
                                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                    Tambahkan paslon agar bilik suara dapat menampilkan pilihan.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {candidates.map((cand) => (
                                <div
                                    key={cand.id}
                                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                                >
                                    <div className="flex min-w-0 items-center gap-3.5">
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                                            <img
                                                src={cand.photo_url || '/images/default-avatar.svg'}
                                                alt={cand.name}
                                                onError={(e) => {
                                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cand.name)}&background=2563eb&color=fff`
                                                }}
                                                className="h-full w-full object-cover object-top"
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-extrabold text-white">
                                                Paslon {cand.candidate_number}
                                            </span>
                                            <h4 className="mt-2 truncate text-base font-bold text-slate-900 dark:text-white">{cand.name}</h4>
                                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">Wakil: {cand.vice_name}</p>

                                            {cand.vision_mission ? (
                                                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                    <ListChecks className="h-3 w-3" />
                                                    Visi &amp; misi terisi
                                                </span>
                                            ) : (
                                                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Visi &amp; misi kosong
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-4">
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{cand.votes}</span>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Suara</p>
                                        </div>
                                        <div className="flex flex-col gap-1 border-l border-slate-200 pl-3 dark:border-slate-800">
                                            <button
                                                onClick={() => setCandidateModal({ open: true, candidate: cand })}
                                                className="rounded-lg bg-amber-50 p-1.5 text-amber-600 transition hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => setPending({ type: 'delete-candidate', id: cand.id })}
                                                className="rounded-lg bg-rose-50 p-1.5 text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && (
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center dark:border-slate-800">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Pemilih Tetap (DPT)</h2>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Kelola akun dan status hak pilih warga</p>
                            </div>

                            <div className="flex w-full items-center gap-3 md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari NIK / Nama..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2 pr-4 pl-9 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                                    />
                                </div>

                                <button
                                    onClick={() => setIsImportOpen(true)}
                                    className="flex shrink-0 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                                >
                                    <FileSpreadsheet className="h-4 w-4" />
                                    <span className="hidden lg:inline">Impor Excel</span>
                                </button>

                                <button
                                    onClick={() => setIsAddVoterOpen(true)}
                                    className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden lg:inline">Tambah DPT</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4">NIK</th>
                                        <th className="px-6 py-4">Nama Pemilih</th>
                                        <th className="px-6 py-4">Tanggal Lahir</th>
                                        <th className="px-6 py-4">RT / RW</th>
                                        <th className="px-6 py-4">Status Voting</th>
                                        <th className="px-6 py-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {filteredVoters.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                                                {voters.length === 0
                                                    ? 'Belum ada data DPT. Tambahkan manual atau impor dari Excel.'
                                                    : 'Tidak ada hasil yang cocok.'}
                                            </td>
                                        </tr>
                                    )}

                                    {filteredVoters.map((voter) => (
                                        <tr key={voter.id} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <td className="px-6 py-4 font-mono font-medium">{voter.nik}</td>
                                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{voter.name}</td>
                                            <td className="px-6 py-4 font-mono">
                                                {voter.birth_date ? (
                                                    voter.birth_date
                                                ) : (
                                                    <span
                                                        title="Pemilih tanpa tanggal lahir tidak dapat login"
                                                        className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                                                    >
                                                        Belum diisi
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">{voter.rt_rw || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                                        voter.has_voted
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                                    }`}
                                                >
                                                    {voter.has_voted ? 'Sudah Memilih' : 'Belum Memilih'}
                                                </span>
                                            </td>
                                            <td className="flex items-center justify-center gap-2 px-6 py-4">
                                                {voter.has_voted && (
                                                    <button
                                                        onClick={() => setPending({ type: 'reset-voter', id: voter.id })}
                                                        title="Reset Status Voting"
                                                        className="rounded-lg bg-amber-50 p-1.5 text-amber-600 transition hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400"
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setPending({ type: 'delete-voter', id: voter.id })}
                                                    title="Hapus Pemilih"
                                                    className="rounded-lg bg-rose-50 p-1.5 text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
                                                >
                                                    <TrashIcon className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {isAddVoterOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Tambah DPT Baru</h3>

                        <form onSubmit={handleAddVoter} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">NIK (16 Digit)</label>
                                <input
                                    type="text"
                                    required
                                    value={newVoter.nik}
                                    onChange={(e) =>
                                        setNewVoter({
                                            ...newVoter,
                                            nik: e.target.value.replace(/\D/g, ''),
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                                />
                                {voterErrors.nik && <p className="mt-1 text-[10px] text-rose-500">{voterErrors.nik}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    value={newVoter.name}
                                    onChange={(e) => setNewVoter({ ...newVoter, name: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                                />
                                {voterErrors.name && <p className="mt-1 text-[10px] text-rose-500">{voterErrors.name}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Tanggal Lahir</label>
                                <DatePicker
                                    value={newVoter.birth_date}
                                    onChange={(value) => setNewVoter({ ...newVoter, birth_date: value })}
                                    placeholder="Pilih tanggal lahir"
                                    required
                                    invalid={Boolean(voterErrors.birth_date)}
                                />
                                {voterErrors.birth_date && <p className="mt-1 text-[10px] text-rose-500">{voterErrors.birth_date}</p>}
                                <p className="mt-1 text-[10px] text-slate-400">Dipakai pemilih untuk login bersama NIK.</p>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">RT / RW (Opsional)</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: 001/002"
                                    value={newVoter.rt_rw}
                                    onChange={(e) => setNewVoter({ ...newVoter, rt_rw: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                                />
                                {voterErrors.rt_rw && <p className="mt-1 text-[10px] text-rose-500">{voterErrors.rt_rw}</p>}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddVoterOpen(false)}
                                    className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingVoter}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:opacity-50"
                                >
                                    {savingVoter && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>{savingVoter ? 'Menyimpan...' : 'Simpan DPT'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {candidateModal.open && (
                <CandidateModal
                    candidate={candidateModal.candidate}
                    onClose={() => setCandidateModal({ open: false, candidate: null })}
                    onSaved={() => {
                        loadDashboard()
                        showNotice('Data paslon berhasil disimpan.')
                    }}
                />
            )}

            {isImportOpen && (
                <ImportDptModal
                    onClose={() => setIsImportOpen(false)}
                    onImported={(message) => {
                        loadDashboard()
                        showNotice(message)
                    }}
                />
            )}

            {confirmDialog()}

            <footer className="mx-auto w-full max-w-7xl px-6 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} Panitia Pemilihan Kepala Desa Digital (E-Voting Admin).
            </footer>
        </div>
    )
}
