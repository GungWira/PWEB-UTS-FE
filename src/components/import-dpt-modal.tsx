import api, { getErrorMessage, TOKEN_KEY } from '@/lib/api'
import { AlertTriangle, CheckCircle2, Copy, Database, Download, FileSpreadsheet, FileUp, ListChecks, Loader2, X, XCircle } from 'lucide-react'
import { useRef, useState } from 'react'

interface RejectedRow {
    line: number
    nik: string
    name: string
    reason: string
}

interface ValidRow {
    nik: string
    name: string
    birth_date: string
    rt_rw: string | null
}

interface PreviewResult {
    total_read: number
    total_valid: number
    valid_rows: ValidRow[]
    preview: { line: number; nik: string; name: string; birth_date: string; rt_rw: string }[]
    invalid: RejectedRow[]
    duplicate_in_file: RejectedRow[]
    duplicate_in_database: RejectedRow[]
}

interface ImportDptModalProps {
    onClose: () => void
    onImported: (message: string) => void
}

export function ImportDptModal({ onClose, onImported }: ImportDptModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>(null)
    const [result, setResult] = useState<PreviewResult | null>(null)
    const [error, setError] = useState('')
    const [verifying, setVerifying] = useState(false)
    const [importing, setImporting] = useState(false)

    const totalRejected = result ? result.invalid.length + result.duplicate_in_file.length + result.duplicate_in_database.length : 0

    const handleDownloadTemplate = async () => {
        const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'
        const token = localStorage.getItem(TOKEN_KEY)

        const response = await fetch(`${baseUrl}/admin/voters/template`, {
            headers: { Authorization: `Bearer ${token}` },
        })

        const blob = await response.blob()
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = 'template-dpt-pemira.csv'
        link.click()
        URL.revokeObjectURL(link.href)
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!file) return

        setError('')
        setVerifying(true)

        const form = new FormData()
        form.append('file', file)

        try {
            const response = await api.post('/admin/voters/import/preview', form)
            setResult(response.data)
        } catch (err) {
            setError(getErrorMessage(err, 'Gagal memverifikasi berkas.'))
        } finally {
            setVerifying(false)
        }
    }

    const handleConfirm = async () => {
        if (!result) return

        setError('')
        setImporting(true)

        try {
            const response = await api.post('/admin/voters/import/confirm', { rows: result.valid_rows })
            onImported(response.data.message)
            onClose()
        } catch (err) {
            setError(getErrorMessage(err, 'Gagal mengimpor data.'))
        } finally {
            setImporting(false)
        }
    }

    const handleReset = () => {
        setResult(null)
        setFile(null)
        setError('')

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
            <div className="my-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                            <FileSpreadsheet className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Impor DPT dari Excel</h3>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {result ? 'Periksa hasil verifikasi sebelum data disimpan' : 'Unggah berkas untuk diverifikasi lebih dulu'}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs leading-relaxed text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                        {error}
                    </div>
                )}

                {!result && (
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Langkah impor</p>
                            <ol className="mt-2 list-outside list-decimal space-y-1 pl-4 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                                <li>Unduh template, lalu isi data pemilih di Excel.</li>
                                <li>
                                    Format kolom <span className="font-mono font-semibold">nik</span> sebagai{' '}
                                    <span className="font-semibold">Teks</span> agar 16 digit tidak berubah jadi notasi ilmiah.
                                </li>
                                <li>
                                    Simpan sebagai <span className="font-semibold">CSV UTF-8 (Comma delimited)</span>, lalu unggah di bawah.
                                </li>
                            </ol>

                            <button
                                type="button"
                                onClick={handleDownloadTemplate}
                                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <Download className="h-4 w-4" />
                                Unduh Template
                            </button>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Berkas CSV</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,text/csv,text/plain"
                                required
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                            />
                            <p className="mt-1 text-[10px] text-slate-400">Kolom: nik, nama, tanggal_lahir, rt_rw. Maksimal 5MB.</p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={verifying || !file}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:opacity-50"
                            >
                                {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                                {verifying ? 'Memverifikasi...' : 'Verifikasi Berkas'}
                            </button>
                        </div>
                    </form>
                )}

                {result && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Database className="h-4 w-4" />
                                    <p className="text-[10px] font-semibold tracking-wider uppercase">Terbaca</p>
                                </div>
                                <h4 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{result.total_read}</h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">baris data</p>
                            </div>

                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <p className="text-[10px] font-semibold tracking-wider uppercase">Siap Impor</p>
                                </div>
                                <h4 className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-400">{result.total_valid}</h4>
                                <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/70">lolos verifikasi</p>
                            </div>

                            <div
                                className={`rounded-2xl border p-4 ${
                                    totalRejected > 0
                                        ? 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40'
                                        : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950'
                                }`}
                            >
                                <div
                                    className={`flex items-center gap-2 ${
                                        totalRejected > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
                                    }`}
                                >
                                    <XCircle className="h-4 w-4" />
                                    <p className="text-[10px] font-semibold tracking-wider uppercase">Dilewati</p>
                                </div>
                                <h4
                                    className={`mt-1 text-2xl font-black ${
                                        totalRejected > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                                    }`}
                                >
                                    {totalRejected}
                                </h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">tidak akan diimpor</p>
                            </div>
                        </div>

                        {result.total_valid > 0 && (
                            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950">
                                    <p className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                                        <ListChecks className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        Data Siap Diimpor
                                    </p>
                                    {result.total_valid > result.preview.length && (
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                            menampilkan {result.preview.length} dari {result.total_valid}
                                        </span>
                                    )}
                                </div>

                                <div className="max-h-56 overflow-y-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="sticky top-0 border-b border-slate-200 bg-white font-semibold text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                                            <tr>
                                                <th className="px-4 py-2.5">Baris</th>
                                                <th className="px-4 py-2.5">NIK</th>
                                                <th className="px-4 py-2.5">Nama</th>
                                                <th className="px-4 py-2.5">Tgl Lahir</th>
                                                <th className="px-4 py-2.5">RT/RW</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                            {result.preview.map((row) => (
                                                <tr key={row.line} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                    <td className="px-4 py-2.5 text-slate-400">{row.line}</td>
                                                    <td className="px-4 py-2.5 font-mono font-medium">{row.nik}</td>
                                                    <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{row.name}</td>
                                                    <td className="px-4 py-2.5 font-mono">{row.birth_date}</td>
                                                    <td className="px-4 py-2.5">{row.rt_rw}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {[
                            {
                                key: 'invalid',
                                rows: result.invalid,
                                title: 'Data Tidak Valid',
                                hint: 'Perbaiki di berkas Excel lalu unggah ulang.',
                                icon: <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />,
                            },
                            {
                                key: 'duplicate_in_file',
                                rows: result.duplicate_in_file,
                                title: 'NIK Ganda di Dalam Berkas',
                                hint: 'Hanya baris pertama yang diimpor, sisanya dilewati.',
                                icon: <Copy className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
                            },
                            {
                                key: 'duplicate_in_database',
                                rows: result.duplicate_in_database,
                                title: 'NIK Sudah Terdaftar di DPT',
                                hint: 'Dilewati agar data tidak ganda.',
                                icon: <Database className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
                            },
                        ]
                            .filter((group) => group.rows.length > 0)
                            .map((group) => (
                                <div key={group.key} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950">
                                        <p className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                                            {group.icon}
                                            {group.title}
                                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {group.rows.length}
                                            </span>
                                        </p>
                                        <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">{group.hint}</p>
                                    </div>

                                    <div className="max-h-44 divide-y divide-slate-200 overflow-y-auto dark:divide-slate-800">
                                        {group.rows.map((row) => (
                                            <div key={`${group.key}-${row.line}`} className="px-4 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                        Baris {row.line}
                                                    </span>
                                                    <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                                                        {row.nik || '(NIK kosong)'}
                                                    </span>
                                                    {row.name && (
                                                        <span className="truncate text-xs text-slate-500 dark:text-slate-400">{row.name}</span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-[11px] leading-relaxed text-rose-600 dark:text-rose-400">{row.reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                        {result.total_valid === 0 && (
                            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/40">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                                <p className="text-xs leading-relaxed text-rose-700 dark:text-rose-300">
                                    Tidak ada data yang bisa diimpor. Perbaiki berkas sesuai catatan di atas, lalu unggah ulang.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                Unggah Berkas Lain
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={result.total_valid === 0 || importing}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                {importing ? 'Mengimpor...' : `Setuju & Impor ${result.total_valid} Data`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
