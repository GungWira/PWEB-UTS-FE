import { ShieldAlert } from 'lucide-react'

interface ConfirmModalProps {
    title: string
    message: string
    tone: 'danger' | 'warning'
    onCancel: () => void
    onConfirm: () => void
}

export function ConfirmModal({ title, message, tone, onCancel, onConfirm }: ConfirmModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                    <div
                        className={`rounded-2xl p-3 ${
                            tone === 'danger'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                    >
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Konfirmasi tindakan administrator</p>
                    </div>
                </div>

                <p className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    {message}
                </p>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`flex-1 rounded-xl py-2.5 text-xs font-semibold text-white shadow-lg transition ${
                            tone === 'danger'
                                ? 'bg-rose-600 shadow-rose-600/20 hover:bg-rose-500'
                                : 'bg-amber-600 shadow-amber-600/20 hover:bg-amber-500'
                        }`}
                    >
                        Ya, Lanjutkan
                    </button>
                </div>
            </div>
        </div>
    )
}
