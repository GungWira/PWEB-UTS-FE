import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

interface DatePickerProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    minYear?: number
    maxDate?: string
    required?: boolean
    invalid?: boolean
}

function pad(value: number): string {
    return String(value).padStart(2, '0')
}

function toIso(year: number, month: number, day: number): string {
    return `${year}-${pad(month + 1)}-${pad(day)}`
}

function formatTampilan(iso: string): string {
    const [year, month, day] = iso.split('-').map(Number)

    return `${day} ${BULAN[month - 1]} ${year}`
}

export function DatePicker({ value, onChange, placeholder = 'Pilih tanggal', minYear = 1900, maxDate, required, invalid }: DatePickerProps) {
    const today = new Date()
    const maxIso = maxDate ?? toIso(today.getFullYear(), today.getMonth(), today.getDate())
    const maxYear = Number(maxIso.slice(0, 4))

    const terpilih = value ? value.split('-').map(Number) : null

    const [open, setOpen] = useState(false)
    const [keAtas, setKeAtas] = useState(false)
    const [tahun, setTahun] = useState(terpilih ? terpilih[0] : maxYear)
    const [bulan, setBulan] = useState(terpilih ? terpilih[1] - 1 : today.getMonth())

    const wrapperRef = useRef<HTMLDivElement>(null)
    const tombolRef = useRef<HTMLButtonElement>(null)

    // Tutup saat klik di luar atau menekan Escape.
    useEffect(() => {
        if (!open) return

        const onPointerDown = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) {
                setOpen(false)
            }
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }

        document.addEventListener('mousedown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)

        return () => {
            document.removeEventListener('mousedown', onPointerDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [open])

    const bukaKalender = () => {
        if (value) {
            const [y, m] = value.split('-').map(Number)
            setTahun(y)
            setBulan(m - 1)
        }

        // Buka ke atas kalau ruang di bawah tidak cukup.
        const rect = tombolRef.current?.getBoundingClientRect()
        setKeAtas(rect ? rect.bottom + 360 > window.innerHeight : false)
        setOpen(true)
    }

    const pilihTanggal = (hari: number) => {
        onChange(toIso(tahun, bulan, hari))
        setOpen(false)
    }

    const gantiBulan = (arah: number) => {
        const tanggal = new Date(tahun, bulan + arah, 1)
        setTahun(tanggal.getFullYear())
        setBulan(tanggal.getMonth())
    }

    const jumlahHari = new Date(tahun, bulan + 1, 0).getDate()
    const awalKolom = new Date(tahun, bulan, 1).getDay()
    const daftarTahun = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i)

    const isoHariIni = toIso(today.getFullYear(), today.getMonth(), today.getDate())

    return (
        <div ref={wrapperRef} className="relative">
            <button
                ref={tombolRef}
                type="button"
                onClick={() => (open ? setOpen(false) : bukaKalender())}
                className={`flex w-full items-center gap-3 rounded-xl border bg-slate-100 py-3 pr-4 pl-3.5 text-left text-sm transition-all dark:bg-slate-950/60 ${
                    invalid
                        ? 'border-rose-400 dark:border-rose-800'
                        : open
                          ? 'border-blue-500 ring-1 ring-blue-500'
                          : 'border-slate-300 dark:border-slate-800'
                }`}
            >
                <Calendar className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500" />
                <span className={value ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
                    {value ? formatTampilan(value) : placeholder}
                </span>
            </button>

            {/* Nilai asli untuk validasi bawaan form */}
            <input type="text" value={value} required={required} readOnly tabIndex={-1} aria-hidden className="sr-only" />

            {open && (
                <div
                    className={`absolute z-30 w-full min-w-[280px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 ${
                        keAtas ? 'bottom-full mb-2' : 'top-full mt-2'
                    }`}
                >
                    <div className="mb-3 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => gantiBulan(-1)}
                            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <select
                            value={bulan}
                            onChange={(e) => setBulan(Number(e.target.value))}
                            className="flex-1 cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                            {BULAN.map((nama, index) => (
                                <option key={nama} value={index}>
                                    {nama}
                                </option>
                            ))}
                        </select>

                        <select
                            value={tahun}
                            onChange={(e) => setTahun(Number(e.target.value))}
                            className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                            {daftarTahun.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={() => gantiBulan(1)}
                            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mb-1 grid grid-cols-7 gap-1">
                        {HARI.map((nama) => (
                            <div key={nama} className="py-1 text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                {nama}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: awalKolom }).map((_, i) => (
                            <div key={`kosong-${i}`} />
                        ))}

                        {Array.from({ length: jumlahHari }, (_, i) => i + 1).map((hari) => {
                            const iso = toIso(tahun, bulan, hari)
                            const dipilih = iso === value
                            const hariIni = iso === isoHariIni
                            const dinonaktifkan = iso > maxIso

                            return (
                                <button
                                    key={hari}
                                    type="button"
                                    disabled={dinonaktifkan}
                                    onClick={() => pilihTanggal(hari)}
                                    className={`h-8 rounded-lg text-xs font-medium transition disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent dark:disabled:text-slate-700 ${
                                        dipilih
                                            ? 'bg-blue-600 font-bold text-white shadow-sm'
                                            : hariIni
                                              ? 'bg-blue-50 font-bold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {hari}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
