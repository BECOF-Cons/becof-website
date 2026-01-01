'use client';

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlock from '@tiptap/extension-code-block';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Link2,
  Image as ImageIcon,
  Code,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Smile,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  label?: string;
  supportArabic?: boolean;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  label,
  supportArabic = false,
}: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = ['😊', '👍', '❤️', '🎉', '✨', '🔥', '💡', '📌', '✅', '⚡', '🚀', '💼', '📊', '🌟', '💪'];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Underline,
      Highlight.configure({
        multicolor: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 rounded p-4 font-mono text-sm',
        },
      }),
      HorizontalRule,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none p-4 min-h-[400px]',
        dir: supportArabic ? 'auto' : 'ltr',
      },
    },
  });

  // Handle Tab key for list indentation
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        
        if (editor.isActive('listItem')) {
          if (event.shiftKey) {
            editor.commands.liftListItem('listItem');
          } else {
            editor.commands.sinkListItem('listItem');
          }
        } else {
          // Insert 4 spaces in regular text
          editor.commands.insertContent('    ');
        }
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('keydown', handleKeyDown);

    return () => {
      editorElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run();
    setShowEmojiPicker(false);
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Arabic Instructions - More Prominent */}
      {supportArabic && (
        <div className="flex items-start gap-3 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 px-4 py-3 rounded-r-lg">
          <Info size={20} className="flex-shrink-0 mt-0.5 text-blue-600" />
          <div className="flex-1">
            <p className="font-semibold text-blue-900 mb-1">✨ Arabic & Multilingual Support Enabled</p>
            <p className="text-gray-700 leading-relaxed">
              <span className="font-medium">For Arabic text:</span> Type or paste content → Select text → Click <span className="inline-flex items-center px-1.5 py-0.5 bg-white rounded border border-gray-300 text-xs">Align Right ➡️</span> button in toolbar. 
              <span className="block mt-1">Mix English, French, and Arabic freely. Each paragraph auto-detects direction.</span>
            </p>
          </div>
        </div>
      )}

      <div className="border border-gray-300 rounded-lg bg-white flex flex-col max-h-[700px]">
        {/* Toolbar - Sticky at top of editor */}
        <div className="sticky top-0 z-20 border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1 items-center shadow-sm shrink-0">
          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('bold') ? 'bg-gray-300' : ''
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('italic') ? 'bg-gray-300' : ''
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('underline') ? 'bg-gray-300' : ''
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('strike') ? 'bg-gray-300' : ''
            }`}
            title="Strikethrough"
          >
            <Strikethrough size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('highlight') ? 'bg-yellow-200' : ''
            }`}
            title="Highlight"
          >
            <Highlighter size={18} />
          </button>

          <div className="w-px bg-gray-300 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''
            }`}
            title="Heading 1"
          >
            <Heading1 size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
            }`}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''
            }`}
            title="Heading 3"
          >
            <Heading3 size={18} />
          </button>

          <div className="w-px bg-gray-300 mx-1" />

          {/* Lists and Blocks */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('bulletList') ? 'bg-gray-300' : ''
            }`}
            title="Bullet List"
          >
            <List size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('orderedList') ? 'bg-gray-300' : ''
            }`}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('blockquote') ? 'bg-gray-300' : ''
            }`}
            title="Quote"
          >
            <Quote size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('codeBlock') ? 'bg-gray-300' : ''
            }`}
            title="Code Block"
          >
            <Code size={18} />
          </button>

          <div className="w-px bg-gray-300 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''
            }`}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''
            }`}
            title="Align Center"
          >
            <AlignCenter size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''
            }`}
            title="Align Right (For Arabic)"
          >
            <AlignRight size={18} />
          </button>

          <div className="w-px bg-gray-300 mx-1" />

          {/* Links and Images */}
          <button
            type="button"
            onClick={editor.isActive('link') ? removeLink : addLink}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('link') ? 'bg-gray-300' : ''
            }`}
            title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}
          >
            <Link2 size={18} />
          </button>
          <button
            type="button"
            onClick={addImage}
            className="p-2 rounded hover:bg-gray-200 transition-colors"
            title="Add Image"
          >
            <ImageIcon size={18} />
          </button>

          <div className="w-px bg-gray-300 mx-1" />

          {/* Emoji Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Insert Emoji"
            >
              <Smile size={18} />
            </button>
            {showEmojiPicker && (
              <div className="absolute top-full mt-1 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10 flex flex-wrap gap-1 w-64">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 rounded hover:bg-gray-200 transition-colors"
            title="Horizontal Line"
          >
            <Minus size={18} />
          </button>

          <div className="w-px bg-gray-300 mx-1" />

          {/* Undo/Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={18} />
          </button>

          <div className="flex-1" />

          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
            title={showPreview ? 'Hide Preview / Masquer l\'aperçu' : 'Show Preview / Afficher l\'aperçu'}
          >
            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="text-sm">{showPreview ? 'Hide / Masquer' : 'Show / Afficher'}</span>
          </button>
        </div>

        {/* Editor and Preview */}
        <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} divide-x divide-gray-300 overflow-hidden flex-1`}>
          {/* Editor */}
          <div className="relative overflow-y-auto">
            <div className="sticky top-0 left-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded z-10 inline-block m-2">
              Editor / Éditeur
            </div>
            <EditorContent editor={editor} />
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="relative overflow-y-auto bg-gray-50">
              <div className="sticky top-0 left-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded z-10 inline-block m-2">
                Preview / Aperçu
              </div>
              <div
                className="p-4 preview-content"
                dir={supportArabic ? 'auto' : 'ltr'}
                dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
