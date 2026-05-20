'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  Code, 
  Redo, 
  Undo,
  ListOrdered,
  Quote
} from 'lucide-react';
import { Button } from './Button';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export const TipTapEditor = ({ content, onChange }: TipTapEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[250px] p-4 font-sans leading-relaxed text-zinc-300 dark:text-zinc-300 bg-background rounded-b-xl border-x border-b border-input',
      },
    },
  });

  // Dynamic content updates (when selecting a different article in the content queue)
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col w-full rounded-xl overflow-hidden border border-input bg-zinc-950/20">
      
      {/* Editor Toolbar */}
      <div className="bg-zinc-900/40 dark:bg-zinc-900/40 border-b border-input p-2 flex flex-wrap gap-1 items-center justify-between">
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Italic className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 2 }) ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Heading1 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 3 }) ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Heading2 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('blockquote') ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Quote className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('codeBlock') ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
};
