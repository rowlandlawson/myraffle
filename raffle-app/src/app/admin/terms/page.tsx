'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  FileText,
  Save,
  Eye,
  Edit3,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  RemoveFormatting,
  RefreshCw,
} from 'lucide-react';

export default function AdminTermsPage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const editorRef = useRef<HTMLDivElement>(null);

  const fetchTerms = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/settings/terms_and_conditions');
      const data = (res as any).data;
      if (res.success && data?.value) {
        setContent(data.value);
        if (editorRef.current) {
          editorRef.current.innerHTML = data.value;
        }
      }
    } catch (err) {
      console.error('Fetch terms error:', err);
      toast.error('Failed to load Terms & Conditions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  // Sync content state when editor content changes
  const handleEditorInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  // Formatting commands for Microsoft Word-like editor
  const format = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleEditorInput();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const htmlToSave = editorRef.current ? editorRef.current.innerHTML : content;
    try {
      const res = await api.put('/api/admin/settings/terms_and_conditions', {
        value: htmlToSave,
      });

      if (res.success) {
        toast.success('Terms & Conditions updated successfully!');
        setContent(htmlToSave);
      } else {
        toast.error(res.message || 'Failed to save Terms & Conditions.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-red-600" size={28} />
            Terms & Conditions Editor
          </h1>
          <p className="text-gray-500 text-sm">
            Format and update the official Terms & Conditions document using a Microsoft Word-style editor.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTerms}
            className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition"
            title="Reload Content"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>

          {/* Toggle Tabs */}
          <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-1.5 rounded-lg font-semibold text-xs transition flex items-center gap-1.5 ${
                activeTab === 'editor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Edit3 size={14} />
              Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 rounded-lg font-semibold text-xs transition flex items-center gap-1.5 ${
                activeTab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye size={14} />
              Live Preview
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition flex items-center gap-2 text-sm shadow-sm disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Terms'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-gray-400">Loading editor document...</div>
      ) : activeTab === 'editor' ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Microsoft Word Style Toolbar */}
          <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center gap-1 text-gray-700 select-none">
            {/* Formatting Group */}
            <div className="flex items-center gap-0.5 border-r border-gray-300 pr-2">
              <button
                type="button"
                onClick={() => format('bold')}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                title="Bold (Ctrl+B)"
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                onClick={() => format('italic')}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                title="Italic (Ctrl+I)"
              >
                <Italic size={16} />
              </button>
              <button
                type="button"
                onClick={() => format('underline')}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                title="Underline (Ctrl+U)"
              >
                <Underline size={16} />
              </button>
              <button
                type="button"
                onClick={() => format('strikeThrough')}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                title="Strikethrough"
              >
                <Strikethrough size={16} />
              </button>
            </div>

            {/* Headings Group */}
            <div className="flex items-center gap-0.5 border-r border-gray-300 px-2">
              <button
                type="button"
                onClick={() => format('formatBlock', '<h1>')}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition flex items-center gap-0.5 font-bold text-xs"
                title="Heading 1"
              >
                <Heading1 size={16} />
              </button>
              <button
                type="button"
                onClick={() => format('formatBlock', '<h2>')}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition flex items-center gap-0.5 font-bold text-xs"
                title="Heading 2"
              >
                <Heading2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => format('formatBlock', '<h3>')}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition flex items-center gap-0.5 font-bold text-xs"
                title="Heading 3"
              >
                <Heading3 size={16} />
              </button>
              <button
                type="button"
                onClick={() => format('formatBlock', '<p>')}
                className="px-2 py-1 hover:bg-gray-200 rounded-lg text-gray-700 transition font-semibold text-xs"
                title="Paragraph / Body text"
              >
                Body
              </button>
            </div>

            {/* Lists Group */}
            <div className="flex items-center gap-0.5 border-r border-gray-300 px-2">
              <button
                type="button"
                onClick={() => format('insertUnorderedList')}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                title="Bullet List"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => format('insertOrderedList')}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                title="Numbered List"
              >
                <ListOrdered size={16} />
              </button>
              <button
                type="button"
                onClick={() => format('formatBlock', '<blockquote>')}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                title="Quote Block"
              >
                <Quote size={16} />
              </button>
            </div>

            {/* Alignment Group */}
            <div className="flex items-center gap-0.5 border-r border-gray-300 px-2">
              <button
                type="button"
                onClick={() => format('justifyLeft')}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                title="Align Left"
              >
                <AlignLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => format('justifyCenter')}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                title="Align Center"
              >
                <AlignCenter size={16} />
              </button>
              <button
                type="button"
                onClick={() => format('justifyRight')}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                title="Align Right"
              >
                <AlignRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => format('justifyFull')}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                title="Justify"
              >
                <AlignJustify size={16} />
              </button>
            </div>

            {/* Clear Formatting */}
            <div className="flex items-center pl-1">
              <button
                type="button"
                onClick={() => format('removeFormat')}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                title="Clear Formatting"
              >
                <RemoveFormatting size={16} />
              </button>
            </div>
          </div>

          {/* Word Document Canvas */}
          <div className="p-8 bg-gray-50 min-h-[500px] flex justify-center">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              dangerouslySetInnerHTML={{ __html: content }}
              className="w-full max-w-3xl min-h-[600px] bg-white p-10 border border-gray-300 shadow-md rounded-lg focus:outline-none prose prose-red max-w-none text-gray-800 font-sans leading-relaxed"
              style={{ minHeight: '600px' }}
            />
          </div>
        </div>
      ) : (
        /* Live Preview Canvas */
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
              Live Preview Output
            </span>
            <span className="text-xs text-gray-400">Rendered exactly as users will see</span>
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: content }}
            className="prose prose-red max-w-none text-gray-800 leading-relaxed space-y-4"
          />
        </div>
      )}
    </div>
  );
}
