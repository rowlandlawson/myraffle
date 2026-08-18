'use client';

import { api } from '@/lib/api';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Edit3,
  Eye,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  RefreshCw,
  RemoveFormatting,
  Save,
  Strikethrough,
  Underline,
} from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminTermsPage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const editorRef = useRef<HTMLDivElement>(null);

  const fetchTerms = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ value?: string }>('/api/settings/terms_and_conditions');
      if (res.success && res.data?.value) {
        setContent(res.data.value);
        if (editorRef.current) {
          editorRef.current.innerHTML = res.data.value;
        }
      }
    } catch (err) {
      console.error('Fetch terms error:', err);
      toast.error('Failed to load Terms & Conditions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-red-50 text-red-600 rounded-xl shrink-0">
              <FileText size={20} className="sm:w-6 sm:h-6" />
            </div>
            <span>Terms & Conditions Editor</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 hidden sm:block">
            Format and update the official Terms & Conditions document using a Microsoft Word-style
            editor.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {/* Toggle Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80 flex-1 sm:flex-initial">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Edit3 size={14} className={activeTab === 'editor' ? 'text-red-600' : ''} />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Eye size={14} className={activeTab === 'preview' ? 'text-red-600' : ''} />
              <span>Preview</span>
            </button>
          </div>

          {/* Reload Button */}
          <button
            onClick={fetchTerms}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition shadow-xs shrink-0"
            title="Reload Content"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-red-600' : ''} />
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 text-xs sm:text-sm shadow-md shadow-red-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Save size={15} />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-gray-400">Loading editor document...</div>
      ) : activeTab === 'editor' ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Microsoft Word Style Toolbar */}
          <div className="bg-gray-50 border-b border-gray-200 p-1.5 sm:p-2 flex flex-nowrap sm:flex-wrap items-center gap-1 text-gray-700 select-none overflow-x-auto no-scrollbar">
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
          <div className="p-2 sm:p-8 bg-gray-50 min-h-[400px] sm:min-h-[500px] flex justify-center">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              dangerouslySetInnerHTML={{ __html: content }}
              className="w-full max-w-3xl min-h-[450px] sm:min-h-[600px] bg-white p-4 sm:p-10 border border-gray-300 shadow-md rounded-lg focus:outline-none prose prose-red max-w-none text-gray-800 font-sans leading-relaxed text-sm sm:text-base"
              style={{ minHeight: '450px' }}
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
