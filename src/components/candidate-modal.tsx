import { RichTextEditor } from '@/components/rich-text-editor'
import api, { getValidationErrors } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

export interface Candidate {
    id: string
    candidate_number: string
    name: string
    vice_name: string
    vision_mission: string | null
    photo_url: string | null
    votes: number
}

interface CandidateModalProps {
    candidate: Candidate | null
    onClose: () => void
    onSaved: () => void
}

export function CandidateModal({ candidate, onClose, onSaved }: CandidateModalProps) {
    const [candidateNumber, setCandidateNumber] = useState(candidate?.candidate_number ?? '')
    const [name, setName] = useState(candidate?.name ?? '')
    const [viceName, setViceName] = useState(candidate?.vice_name ?? '')
    const [visionMission, setVisionMission] = useState(candidate?.vision_mission ?? '')
    const [photo, setPhoto] = useState<File | null>(null)

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})
        setSaving(true)

        const form = new FormData()
        form.append('candidate_number', candidateNumber)
        form.append('name', name)
        form.append('vice_name', viceName)
        form.append('vision_mission', visionMission)

        if (photo) {
            form.append('photo', photo)
        }

        try {
            const url = candidate ? `/admin/candidates/${candidate.id}` : '/admin/candidates'
            await api.post(url, form)
            onSaved()
            onClose()
        } catch (error) {
            setErrors(getValidationErrors(error))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
            <div className="my-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">{candidate ? 'Edit Data Paslon' : 'Tambah Paslon Baru'}</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Nomor Urut Paslon</label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: 01"
                            value={candidateNumber}
                            onChange={(e) => setCandidateNumber(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                        />
                        {errors.candidate_number && <p className="mt-1 text-[10px] text-rose-500">{errors.candidate_number}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Nama Calon Ketua</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                            />
                            {errors.name && <p className="mt-1 text-[10px] text-rose-500">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Nama Calon Wakil</label>
                            <input
                                type="text"
                                required
                                value={viceName}
                                onChange={(e) => setViceName(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                            />
                            {errors.vice_name && <p className="mt-1 text-[10px] text-rose-500">{errors.vice_name}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Visi &amp; Misi</label>
                        <RichTextEditor
                            value={visionMission}
                            onChange={setVisionMission}
                            placeholder="Tuliskan visi, lalu rincikan misi dalam bentuk daftar bernomor..."
                        />
                        {errors.vision_mission && <p className="mt-1 text-[10px] text-rose-500">{errors.vision_mission}</p>}
                        <p className="mt-1 text-[10px] text-slate-400">
                            Gunakan tombol format di atas untuk menebalkan teks dan membuat daftar misi.
                        </p>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Upload Foto Kandidat</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                        />
                        {errors.photo && <p className="mt-1 text-[10px] text-rose-500">{errors.photo}</p>}
                        <p className="mt-1 text-[10px] text-slate-400">Format: JPG, PNG, WEBP (Maksimal 2MB)</p>
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
                            disabled={saving}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:opacity-50"
                        >
                            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            <span>{saving ? 'Menyimpan...' : 'Simpan Paslon'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
