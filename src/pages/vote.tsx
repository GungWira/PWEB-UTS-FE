import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth, type Voter } from '@/context/auth-context'
import api, { getErrorMessage } from '@/lib/api'
import { AlertTriangle, ArrowLeft, Loader2, ScrollText, ShieldCheck, Vote, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Candidate {
    id: string
    candidate_number: string
    name: string
    vice_name: string
    vision_mission: string | null
    photo_url: string | null
}

export default function VotePage() {
    const { user, refreshVoter } = useAuth()
    const navigate = useNavigate()
    const voter = user?.data as Voter

    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [selected, setSelected] = useState<Candidate | null>(null)
    const [visionCandidate, setVisionCandidate] = useState<Candidate | null>(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (voter.has_voted) {
            navigate('/dashboard', { replace: true })
            return
        }

        api.get('/vote/candidates')
            .then((response) => setCandidates(response.data.candidates))
            .catch((err) => setError(getErrorMessage(err, 'Gagal memuat data paslon.')))
            .finally(() => setLoading(false))
    }, [voter.has_voted, navigate])

    const handleConfirmVote = async () => {
        if (!selected) return

        setSubmitting(true)

        try {
            await api.post('/vote', { candidate_id: selected.id })
            await refreshVoter()
            navigate('/vote/success', { state: { candidateName: selected.name } })
        } catch (err) {
            setError(getErrorMessage(err, 'Gagal mengirim suara. Silakan coba lagi.'))
            setSelected(null)
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
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-lg leading-none font-bold tracking-tight text-slate-900 dark:text-white">Bilik Suara Digital</h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Pilih Pasangan Calon Kepala Desa</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-700 shadow-sm backdrop-blur sm:flex dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Pilihan Bersifat Rahasia</span>
                    </div>
                </div>
            </header>

            <main className="z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-8">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Gunakan Hak Pilih Anda</h2>
                    <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-400">
                        Klik pada kartu Pasangan Calon di bawah ini untuk menentukan pilihan Anda.
                    </p>
                </div>

                {error && (
                    <div className="mx-auto mb-6 w-full max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                    </div>
                )}

                {!loading && candidates.length === 0 && (
                    <div className="mx-auto w-full max-w-md rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                        <Vote className="mx-auto h-8 w-8 text-slate-400" />
                        <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Belum ada pasangan calon</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Hubungi panitia pemilihan.</p>
                    </div>
                )}

                <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-8 md:grid-cols-2">
                    {candidates.map((cand) => (
                        <div
                            key={cand.id}
                            onClick={() => setSelected(cand)}
                            className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition-all duration-300 hover:border-blue-500/50 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-2xl"
                        >
                            <div>
                                <div className="relative mb-4 h-[320px] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900">
                                    <img
                                        src={cand.photo_url || '/images/default-avatar.svg'}
                                        alt={cand.name}
                                        onError={(e) => {
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cand.name)}&background=2563eb&color=fff`
                                        }}
                                        className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-105"
                                    />
                                    <span className="absolute top-3 right-3 z-10 rounded-xl bg-blue-600 px-3 py-1 text-xs font-extrabold text-white shadow-md">
                                        No. {cand.candidate_number}
                                    </span>
                                </div>

                                <h3 className="text-xl leading-tight font-bold text-slate-900 dark:text-white">{cand.name}</h3>
                                <p className="mt-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">Wakil: {cand.vice_name}</p>

                                {cand.vision_mission && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setVisionCandidate(cand)
                                        }}
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-blue-500/50 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800/80 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                                    >
                                        <ScrollText className="h-4 w-4" />
                                        <span>Baca Visi &amp; Misi</span>
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                            >
                                <Vote className="h-4 w-4" />
                                <span>Pilih Paslon {cand.candidate_number}</span>
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            {visionCandidate && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 px-4 py-8 backdrop-blur-sm"
                    onClick={() => setVisionCandidate(null)}
                >
                    <div
                        className="relative my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6 dark:border-slate-800">
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
                                    <img
                                        src={visionCandidate.photo_url || '/images/default-avatar.svg'}
                                        alt={visionCandidate.name}
                                        onError={(e) => {
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(visionCandidate.name)}&background=2563eb&color=fff`
                                        }}
                                        className="h-full w-full object-cover object-top"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-[10px] font-extrabold text-white">
                                        PASLON NO. {visionCandidate.candidate_number}
                                    </span>
                                    <h3 className="mt-2 truncate text-lg leading-tight font-bold text-slate-900 dark:text-white">
                                        {visionCandidate.name}
                                    </h3>
                                    <p className="mt-0.5 truncate text-xs font-medium text-blue-600 dark:text-blue-400">
                                        Wakil: {visionCandidate.vice_name}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setVisionCandidate(null)}
                                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="max-h-[55vh] overflow-y-auto p-6">
                            <div className="mb-3 flex items-center gap-2">
                                <ScrollText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Visi &amp; Misi</h4>
                            </div>
                            <div className="rich-text-view text-sm" dangerouslySetInnerHTML={{ __html: visionCandidate.vision_mission ?? '' }} />
                        </div>

                        <div className="flex gap-3 p-6 pt-0">
                            <button
                                type="button"
                                onClick={() => setVisionCandidate(null)}
                                className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                Tutup
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const chosen = visionCandidate
                                    setVisionCandidate(null)
                                    setSelected(chosen)
                                }}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
                            >
                                <Vote className="h-4 w-4" />
                                <span>Pilih Paslon {visionCandidate.candidate_number}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-800/50 dark:bg-amber-950/40">
                                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Konfirmasi Pilihan</h3>
                        </div>

                        <p className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            Apakah Anda yakin ingin memilih{' '}
                            <strong className="text-slate-900 dark:text-white">
                                Paslon No. {selected.candidate_number} ({selected.name})
                            </strong>
                            ? Pilihan bersifat final dan tidak dapat diubah setelah dikirim.
                        </p>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                disabled={submitting}
                                className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                Cek Kembali
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmVote}
                                disabled={submitting}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 disabled:opacity-50"
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                <span>{submitting ? 'Mengirim...' : 'Ya, Kirim Suara'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="z-10 mx-auto w-full max-w-7xl px-6 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} Panitia Pemilihan Kepala Desa Digital (E-Voting).
            </footer>
        </div>
    )
}
