'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Clock, Users, Zap, X, Save, CheckCircle, Pin } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  useAdminTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  AdminTask,
  CreateTaskInput,
} from '@/lib/hooks/useAdminTasks';

const TASK_TYPE_LABELS: Record<string, string> = {
  WATCH_AD_VIDEO: 'Video Ad',
  WATCH_AD_PICTURE: 'Picture Ad',
  WATCH_AD_BANNER: 'Banner Ad',
  REFERRAL: 'Referral',
  SURVEY: 'Survey',
  SOCIAL_SHARE: 'Social Share',
  DAILY_LOGIN: 'Daily Login',
  SOCIAL_LIKE: 'Social Like',
  SOCIAL_COMMENT: 'Social Comment',
  SOCIAL_FOLLOW: 'Social Follow',
};

const TASK_TYPE_COLORS: Record<string, string> = {
  WATCH_AD_VIDEO: 'bg-blue-100 text-blue-700',
  WATCH_AD_PICTURE: 'bg-cyan-100 text-cyan-700',
  WATCH_AD_BANNER: 'bg-sky-100 text-sky-700',
  REFERRAL: 'bg-pink-100 text-pink-700',
  SURVEY: 'bg-purple-100 text-purple-700',
  SOCIAL_SHARE: 'bg-green-100 text-green-700',
  DAILY_LOGIN: 'bg-orange-100 text-orange-700',
  SOCIAL_LIKE: 'bg-red-100 text-red-700',
  SOCIAL_COMMENT: 'bg-teal-100 text-teal-700',
  SOCIAL_FOLLOW: 'bg-indigo-100 text-indigo-700',
};

// Types that should NOT appear in the "Create New Task" dropdown
const AD_TASK_TYPES = ['WATCH_AD_VIDEO', 'WATCH_AD_PICTURE', 'WATCH_AD_BANNER'];

// Only non-ad types available for manual creation
const CREATABLE_TASK_TYPES = Object.entries(TASK_TYPE_LABELS).filter(
  ([key]) => !AD_TASK_TYPES.includes(key),
);

const PLATFORM_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'discord', label: 'Discord' },
];

const EMPTY_FORM: CreateTaskInput = {
  type: 'SOCIAL_LIKE',
  title: '',
  description: '',
  points: 10,
  actionUrl: '',
  platform: '',
  adDuration: undefined,
  maxCompletions: undefined,
  dailyLimit: undefined,
  expiresAt: '',
  priority: 0,
  isPinned: false,
};

export default function AdminTasksPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminTasks(page);
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<AdminTask | null>(null);
  const [form, setForm] = useState<CreateTaskInput>(EMPTY_FORM);
  const [adEdits, setAdEdits] = useState<Record<string, { points: number; dailyLimit: number }>>({});
  const [savingAdId, setSavingAdId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => { } });

  const tasks = data?.tasks ?? [];
  const pagination = data?.pagination;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openCreateForm = () => {
    setEditingTask(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (task: AdminTask) => {
    setEditingTask(task);
    setForm({
      type: task.type,
      title: task.title,
      description: task.description,
      points: task.points,
      actionUrl: task.actionUrl || '',
      platform: task.platform || '',
      adDuration: task.adDuration || undefined,
      maxCompletions: task.maxCompletions || undefined,
      expiresAt: task.expiresAt ? task.expiresAt.split('T')[0] : '',
      priority: task.priority ?? 0,
      isPinned: task.isPinned ?? false,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await updateMutation.mutateAsync({ id: editingTask.id, ...form });
      } else {
        await createMutation.mutateAsync(form);
      }
      setShowForm(false);
      setEditingTask(null);
      setForm(EMPTY_FORM);
      showToast(editingTask ? 'Task updated successfully!' : 'Task created successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to save task');
    }
  };

  const handleDelete = (task: AdminTask) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Task',
      message: `Are you sure you want to permanently delete "${task.title}"? This will also remove all user completion records for this task. This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        try {
          await deleteMutation.mutateAsync(task.id);
          showToast('Task deleted successfully.');
        } catch (err: any) {
          showToast(err.message || 'Failed to delete task');
        }
      },
    });
  };

  const handleToggleActive = async (task: AdminTask) => {
    try {
      await updateMutation.mutateAsync({ id: task.id, isActive: !task.isActive });
      showToast(`Task ${task.isActive ? 'deactivated' : 'activated'} successfully.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle task');
    }
  };

  const handleTogglePin = async (task: AdminTask) => {
    try {
      await updateMutation.mutateAsync({ id: task.id, isPinned: !task.isPinned });
      showToast(`Task ${task.isPinned ? 'unpinned' : 'pinned'} successfully.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle pin');
    }
  };

  const isSocialType = ['SOCIAL_LIKE', 'SOCIAL_COMMENT', 'SOCIAL_SHARE', 'SOCIAL_FOLLOW'].includes(form.type);
  const isAdType = form.type.startsWith('WATCH_AD');

  // Separate ad tasks from regular tasks for display
  const adTasks = tasks.filter((t) => AD_TASK_TYPES.includes(t.type));
  const regularTasks = tasks.filter((t) => !AD_TASK_TYPES.includes(t.type));

  const getAdEdit = (task: AdminTask) => {
    return adEdits[task.id] || { points: task.points, dailyLimit: task.dailyLimit || 5 };
  };

  const setAdEdit = (taskId: string, field: 'points' | 'dailyLimit', value: number) => {
    setAdEdits((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId] || {},
        points: prev[taskId]?.points ?? tasks.find((t) => t.id === taskId)?.points ?? 0,
        dailyLimit: prev[taskId]?.dailyLimit ?? tasks.find((t) => t.id === taskId)?.dailyLimit ?? 5,
        [field]: value,
      },
    }));
  };

  const hasAdChanged = (task: AdminTask) => {
    const edit = adEdits[task.id];
    if (!edit) return false;
    return edit.points !== task.points || edit.dailyLimit !== (task.dailyLimit || 5);
  };

  const handleSaveAd = async (task: AdminTask) => {
    const edit = getAdEdit(task);
    setSavingAdId(task.id);
    try {
      await updateMutation.mutateAsync({
        id: task.id,
        points: edit.points,
        dailyLimit: edit.dailyLimit,
      });
      setAdEdits((prev) => { const n = { ...prev }; delete n[task.id]; return n; });
      showToast(`${TASK_TYPE_LABELS[task.type]} updated successfully!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update ad pricing');
    } finally {
      setSavingAdId(null);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-500 mt-1">Create and manage user tasks for earning raffle points</p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition shadow-sm"
        >
          <Plus size={18} /> Create Task
        </button>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {Object.entries(TASK_TYPE_LABELS)
                    .filter(([key]) => !AD_TASK_TYPES.includes(key))
                    .map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Like our TikTok video"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe what the user needs to do"
                  required
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Points */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Points Reward</label>
                <input
                  type="number"
                  value={form.points}
                  onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 0 })}
                  min={1}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Platform (for social tasks) */}
              {isSocialType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <select
                    value={form.platform || ''}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {PLATFORM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action URL (for social tasks) */}
              {isSocialType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Post URL</label>
                  <input
                    type="url"
                    value={form.actionUrl || ''}
                    onChange={(e) => setForm({ ...form, actionUrl: e.target.value })}
                    placeholder="https://www.tiktok.com/@yourpage/video/..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Ad Duration (for ad tasks) */}
              {isAdType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad Duration (seconds)</label>
                  <input
                    type="number"
                    value={form.adDuration || ''}
                    onChange={(e) => setForm({ ...form, adDuration: parseInt(e.target.value) || undefined })}
                    placeholder="30"
                    min={5}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (optional)</label>
                <input
                  type="date"
                  value={form.expiresAt || ''}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Priority & Pin */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <input
                    type="number"
                    value={form.priority ?? 0}
                    onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                    min={0}
                    max={100}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">Higher = shown first</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pinned</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isPinned: !form.isPinned })}
                    className={`w-full flex items-center justify-center gap-2 border rounded-lg px-3 py-2 text-sm font-semibold transition ${form.isPinned
                        ? 'bg-amber-50 border-amber-300 text-amber-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                  >
                    <Pin size={14} className={form.isPinned ? 'text-amber-600' : ''} />
                    {form.isPinned ? 'Pinned' : 'Not Pinned'}
                  </button>
                  <p className="text-xs text-gray-400 mt-1">Always shown to users</p>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ad Pricing Section */}
      {adTasks.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Ad Pricing & Limits</h2>
          <p className="text-sm text-gray-500 mb-5">Adjust the points and daily limits for each ad format. Click Save to apply changes.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {adTasks.map((task) => {
              const edit = getAdEdit(task);
              const changed = hasAdChanged(task);
              return (
                <div key={task.id} className={`rounded-xl border p-5 ${task.isActive ? 'border-gray-200' : 'border-gray-100 opacity-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TASK_TYPE_COLORS[task.type] || 'bg-gray-100 text-gray-700'}`}>
                      {TASK_TYPE_LABELS[task.type] || task.type}
                    </span>
                    <button
                      onClick={() => handleToggleActive(task)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full transition cursor-pointer ${task.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {task.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-3">{task.title}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Points per completion</label>
                      <input
                        type="number"
                        value={edit.points}
                        min={1}
                        onChange={(e) => setAdEdit(task.id, 'points', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Daily limit per user</label>
                      <input
                        type="number"
                        value={edit.dailyLimit}
                        min={1}
                        onChange={(e) => setAdEdit(task.id, 'dailyLimit', parseInt(e.target.value) || 1)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Users size={12} />
                        <span>{task._count.completions} total completions</span>
                      </div>
                      <button
                        onClick={() => handleSaveAd(task)}
                        disabled={!changed || savingAdId === task.id}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm ${changed
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        <Save size={14} />
                        {savingAdId === task.id ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tasks Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error instanceof Error ? error.message : 'Failed to load tasks'}</p>
        </div>
      ) : regularTasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Zap size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No tasks yet</h3>
          <p className="text-gray-500 mb-4">Create your first task to start rewarding users</p>
          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            <Plus size={18} /> Create Task
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Other Tasks</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Task</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Points</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Platform</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Priority</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Completions</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {regularTasks.map((task) => (
                  <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${TASK_TYPE_COLORS[task.type] || 'bg-gray-100 text-gray-700'}`}>
                        {TASK_TYPE_LABELS[task.type] || task.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">{task.points}</span>
                    </td>
                    <td className="py-3 px-4">
                      {task.platform ? (
                        <span className="text-gray-700 capitalize">{task.platform}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {task.isPinned && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            <Pin size={10} /> Pinned
                          </span>
                        )}
                        <span className="text-xs font-mono text-gray-500">{task.priority ?? 0}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-gray-400" />
                        <span className="text-gray-700">{task._count.completions}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(task)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full transition cursor-pointer ${task.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                      >
                        {task.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleTogglePin(task)}
                          className={`p-1.5 rounded-lg transition ${task.isPinned ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'hover:bg-gray-100 text-gray-400'}`}
                          title={task.isPinned ? 'Unpin' : 'Pin'}
                        >
                          <Pin size={16} />
                        </button>
                        {task.actionUrl && (
                          <a
                            href={task.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition"
                            title="Open link"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <button
                          onClick={() => openEditForm(task)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(task)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} tasks)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[110] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700">
            <CheckCircle size={18} className="text-green-400 shrink-0" />
            <p className="text-sm font-medium">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
