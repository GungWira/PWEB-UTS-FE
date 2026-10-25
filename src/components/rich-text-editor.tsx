import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Heading3, Italic, List, ListOrdered, Quote, Redo2, Strikethrough, Underline as UnderlineIcon, Undo2 } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

interface ToolbarButtonProps {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    title: string
    children: ReactNode
}

function ToolbarButton({ onClick, isActive = false, disabled = false, title, children }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`rounded-lg p-1.5 transition disabled:cursor-not-allowed disabled:opacity-40 ${
                isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }`}
        >
            {children}
        </button>
    )
}

function Toolbar({ editor }: { editor: Editor }) {
    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-100 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Tebal">
                <Bold className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Miring">
                <Italic className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Garis bawah">
                <UnderlineIcon className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Coret">
                <Strikethrough className="h-3.5 w-3.5" />
            </ToolbarButton>

            <span className="mx-1 h-4 w-px bg-slate-300 dark:bg-slate-700" />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title="Sub judul"
            >
                <Heading3 className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Daftar titik"
            >
                <List className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Daftar nomor"
            >
                <ListOrdered className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Kutipan">
                <Quote className="h-3.5 w-3.5" />
            </ToolbarButton>

            <span className="mx-1 h-4 w-px bg-slate-300 dark:bg-slate-700" />

            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Urungkan">
                <Undo2 className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Ulangi">
                <Redo2 className="h-3.5 w-3.5" />
            </ToolbarButton>
        </div>
    )
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [3, 4] },
                codeBlock: false,
                code: false,
                horizontalRule: false,
            }),
            Underline,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            onChange(html === '<p></p>' ? '' : html)
        },
        editorProps: {
            attributes: {
                class: 'rich-text-content min-h-[140px] max-h-[260px] overflow-y-auto px-4 py-3 text-xs leading-relaxed focus:outline-none',
            },
        },
    })

    // Sinkronkan ulang saat form di-reset atau beralih ke paslon lain.
    useEffect(() => {
        if (editor && !editor.isDestroyed && value !== editor.getHTML()) {
            editor.commands.setContent(value || '', false)
        }
    }, [value, editor])

    if (!editor) {
        return <div className="h-[180px] animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-500 dark:border-slate-800 dark:bg-slate-950">
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
            {editor.isEmpty && placeholder && (
                <p className="pointer-events-none -mt-9 px-4 text-xs text-slate-400 dark:text-slate-500">{placeholder}</p>
            )}
        </div>
    )
}
