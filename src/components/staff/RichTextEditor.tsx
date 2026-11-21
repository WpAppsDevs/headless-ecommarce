'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Link2, List, ListOrdered } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDictionary } from '@/i18n/LocaleProvider';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  id?: string;
  invalid?: boolean;
}

/**
 * A deliberately small rich text editor: headings, emphasis, lists and links.
 *
 * Product descriptions are scanned, not read as essays, so the toolbar offers
 * only what makes a description scannable. The HTML it produces is sanitized by
 * WordPress (`wp_kses_post`) before it is stored.
 */
export function RichTextEditor({ value, onChange, id, invalid }: RichTextEditorProps) {
  const copy = useDictionary().staff.editor;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    editorProps: {
      attributes: {
        id: id ?? 'staff-description',
        class:
          'prose-sm min-h-[140px] max-w-none px-3 py-2 text-sm text-brand-text focus:outline-none',
        'aria-label': copy.label,
      },
    },
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
  });

  // Keep the editor in step when the form loads a product after mount.
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // Only react to an external value change, not to the echo of our own update.
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="min-h-[180px] animate-pulse rounded-lg border border-brand-border bg-brand-bg" />
    );
  }

  const buttons = [
    {
      label: copy.bold,
      active: editor.isActive('bold'),
      icon: Bold,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: copy.italic,
      active: editor.isActive('italic'),
      icon: Italic,
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: copy.bullets,
      active: editor.isActive('bulletList'),
      icon: List,
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: copy.numbers,
      active: editor.isActive('orderedList'),
      icon: ListOrdered,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: copy.link,
      active: editor.isActive('link'),
      icon: Link2,
      run: () => {
        const previous = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt(copy.linkPrompt, previous ?? 'https://');

        if (url === null) return;

        if (url === '') {
          editor.chain().focus().unsetLink().run();
          return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      },
    },
  ];

  return (
    <div
      className={cn(
        'rounded-lg border border-brand-border bg-white',
        invalid && 'border-destructive',
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-brand-border px-2 py-1.5">
        {buttons.map(({ label, active, icon: Icon, run }) => (
          <button
            key={label}
            type="button"
            onClick={run}
            aria-label={label}
            aria-pressed={active}
            className={cn(
              'rounded-md p-1.5 text-brand-text-muted hover:bg-brand-accent-light hover:text-brand-accent-strong',
              active && 'bg-brand-accent-light text-brand-accent-strong',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
