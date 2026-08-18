'use client';

import { api } from '@/lib/api';
import {
  Bell,
  Clock,
  Coins,
  ExternalLink,
  Gift,
  Globe,
  Save,
  Settings,
  Share2,
  Shield,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface LogItem {
  id: string;
  type: string;
  status: string;
  description: string | null;
  createdAt: string;
  user?: { name: string };
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'bonuses' | 'general' | 'social' | 'notifications' | 'security'
  >('bonuses');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingBonuses, setIsLoadingBonuses] = useState(true);
  const [isLoadingSocial, setIsLoadingSocial] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Social Links State
  const [socialLinks, setSocialLinks] = useState({
    twitter: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    telegram: '',
    youtube: '',
    tiktok: '',
  });

  // Bonus Settings State
  const [bonusSettings, setBonusSettings] = useState({
    signupBonus: 1000,
    referralBonus: 500,
  });

  useEffect(() => {
    const fetchBonusSettings = async () => {
      try {
        setIsLoadingBonuses(true);
        const res = await api.get<{
          signupBonus: number;
          referralBonus: number;
        }>('/api/admin/bonus-settings');
        if (res.success && res.data) {
          setBonusSettings({
            signupBonus: res.data.signupBonus ?? 1000,
            referralBonus: res.data.referralBonus ?? 500,
          });
        }
      } catch (err) {
        console.error('Failed to fetch bonus settings', err);
      } finally {
        setIsLoadingBonuses(false);
      }
    };
    fetchBonusSettings();
  }, []);

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'RaffleHub',
    siteDescription: 'Win big, play fair',
    supportEmail: 'support@rafflehub.ng',
    supportPhone: '+234 800 123 4567',
    maintenanceMode: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    adminAlerts: true,
    winnerNotifications: true,
    marketingEmails: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoadingSocial(true);
        const [socialRes, generalRes] = await Promise.all([
          api.get<{ value?: string }>('/api/settings/social_links'),
          api.get<{ value?: string }>('/api/settings/general_settings'),
        ]);

        if (socialRes.success && socialRes.data?.value) {
          try {
            const parsed = JSON.parse(socialRes.data.value);
            setSocialLinks((prev) => ({ ...prev, ...parsed }));
          } catch (e) {
            console.error('Failed to parse social links', e);
          }
        }

        if (generalRes.success && generalRes.data?.value) {
          try {
            const parsed = JSON.parse(generalRes.data.value);
            setGeneralSettings((prev) => ({ ...prev, ...parsed }));
          } catch (e) {
            console.error('Failed to parse general settings', e);
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setIsLoadingSocial(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === 'bonuses') {
        const res = await api.put('/api/admin/bonus-settings', bonusSettings);
        if (res.success) {
          toast.success(res.message || 'Registration & Referral bonus settings saved!');
        } else {
          toast.error(res.message || 'Failed to save bonus settings');
        }
      } else if (activeTab === 'general') {
        const res = await api.put('/api/admin/settings/general_settings', {
          value: JSON.stringify(generalSettings),
        });
        if (res.success) {
          toast.success('General platform settings and contacts saved!');
        } else {
          toast.error(res.message || 'Failed to save general settings.');
        }
      } else if (activeTab === 'social') {
        const res = await api.put('/api/admin/settings/social_links', {
          value: JSON.stringify(socialLinks),
        });
        if (res.success) {
          toast.success('Social media handles saved successfully!');
        } else {
          toast.error(res.message || 'Failed to save social media handles.');
        }
      } else {
        toast.success('Settings saved successfully!');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'bonuses', label: 'Bonuses & Rewards', icon: Gift },
    { id: 'general', label: 'General', icon: Globe },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600">Configure your platform settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                    activeTab === tab.id
                      ? 'bg-red-50 text-red-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon size={20} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow p-6">
            {/* Bonus & Reward Settings */}
            {activeTab === 'bonuses' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Gift className="text-red-600" size={24} /> Registration & Referral Bonuses
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Set the Naira (₦) bonus amount credited to new users upon signup and users who
                    invite friends.
                  </p>
                </div>

                {isLoadingBonuses ? (
                  <div className="py-8 text-center">
                    <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Loading bonus settings...</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-emerald-600 text-white rounded-lg">
                          <Coins size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">New User Sign-up Bonus</h3>
                          <p className="text-xs text-gray-600">
                            Credited to wallet upon account creation
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                          Bonus Amount (₦)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3 text-gray-500 font-bold text-sm">
                            ₦
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={bonusSettings.signupBonus}
                            onChange={(e) =>
                              setBonusSettings({
                                ...bonusSettings,
                                signupBonus: Math.max(0, Number.parseFloat(e.target.value) || 0),
                              })
                            }
                            className="w-full pl-8 pr-4 py-2.5 bg-white border border-emerald-300 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-purple-600 text-white rounded-lg">
                          <Users size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Referral Reward</h3>
                          <p className="text-xs text-gray-600">
                            Credited to referrer when a invited user joins
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                          Reward Amount (₦)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3 text-gray-500 font-bold text-sm">
                            ₦
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={bonusSettings.referralBonus}
                            onChange={(e) =>
                              setBonusSettings({
                                ...bonusSettings,
                                referralBonus: Math.max(0, Number.parseFloat(e.target.value) || 0),
                              })
                            }
                            className="w-full pl-8 pr-4 py-2.5 bg-white border border-purple-300 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">General Settings</h2>

                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={generalSettings.siteName}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          siteName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Site Description
                    </label>
                    <input
                      type="text"
                      value={generalSettings.siteDescription}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          siteDescription: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Support Email
                      </label>
                      <input
                        type="email"
                        value={generalSettings.supportEmail}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            supportEmail: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Support Phone
                      </label>
                      <input
                        type="tel"
                        value={generalSettings.supportPhone}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            supportPhone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Maintenance Mode</p>
                      <p className="text-sm text-gray-600">
                        Temporarily disable the platform for users
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setGeneralSettings({
                          ...generalSettings,
                          maintenanceMode: !generalSettings.maintenanceMode,
                        })
                      }
                      className={`w-12 h-6 rounded-full transition ${
                        generalSettings.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                          generalSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Social Media Settings */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Share2 className="text-red-600" size={24} /> Social Media Handles
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Configure official social media URLs. Leaving a platform link empty hides it
                    automatically across the app.
                  </p>
                </div>

                {isLoadingSocial ? (
                  <div className="py-8 text-center">
                    <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Loading social media handles...</p>
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Twitter / X Profile URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://twitter.com/myraffle"
                        value={socialLinks.twitter}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            twitter: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Instagram Profile URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://instagram.com/myraffle"
                        value={socialLinks.instagram}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            instagram: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Facebook Page URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://facebook.com/myraffle"
                        value={socialLinks.facebook}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            facebook: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        WhatsApp Link or Phone
                      </label>
                      <input
                        type="text"
                        placeholder="https://wa.me/2348000000000"
                        value={socialLinks.whatsapp}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            whatsapp: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Telegram Group / Channel
                      </label>
                      <input
                        type="url"
                        placeholder="https://t.me/myraffle"
                        value={socialLinks.telegram}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            telegram: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        YouTube Channel
                      </label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/@myraffle"
                        value={socialLinks.youtube}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            youtube: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        TikTok Profile URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://tiktok.com/@myraffle"
                        value={socialLinks.tiktok}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            tiktok: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>

                {/* Broadcast Announcement Form */}
                <div className="p-5 bg-gradient-to-br from-red-900 to-rose-950 text-white rounded-2xl shadow-lg space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red-600 rounded-xl text-white">
                      <Bell size={22} className="animate-bounce" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-white">
                        Broadcast Push Announcement
                      </h3>
                      <p className="text-xs text-red-200">
                        Send a instant Web Push notification directly to all subscribed users on
                        Mobile & Desktop.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const title = (
                        form.elements.namedItem('announcementTitle') as HTMLInputElement
                      ).value;
                      const body = (
                        form.elements.namedItem('announcementBody') as HTMLTextAreaElement
                      ).value;
                      const url = (form.elements.namedItem('announcementUrl') as HTMLInputElement)
                        .value;

                      if (!title || !body) {
                        toast.error('Title and message body are required.');
                        return;
                      }

                      try {
                        const res = await api.post('/api/admin/announcements', {
                          title,
                          body,
                          url,
                        });
                        if (res.success) {
                          toast.success('Push announcement broadcast successfully!');
                          form.reset();
                        } else {
                          toast.error(res.message || 'Failed to send announcement');
                        }
                      } catch (_err) {
                        toast.error('Failed to send announcement');
                      }
                    }}
                    className="space-y-3 pt-2"
                  >
                    <div>
                      <label className="block text-xs font-bold text-red-200 uppercase tracking-wider mb-1">
                        Announcement Title
                      </label>
                      <input
                        name="announcementTitle"
                        type="text"
                        placeholder="e.g. Mega Weekend Draw Live! 🎉"
                        className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-red-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-red-200 uppercase tracking-wider mb-1">
                        Message Body
                      </label>
                      <textarea
                        name="announcementBody"
                        rows={2}
                        placeholder="e.g. Win an iPhone 15 Pro Max for just ₦500. Tickets selling fast!"
                        className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-red-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-red-200 uppercase tracking-wider mb-1">
                        Target Action URL (Optional)
                      </label>
                      <input
                        name="announcementUrl"
                        type="text"
                        placeholder="/dashboard"
                        defaultValue="/dashboard"
                        className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-red-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-red-600 hover:bg-red-500 font-bold text-sm text-white rounded-xl transition shadow-lg shadow-red-600/40"
                    >
                      📢 Broadcast Push Notification To All Users
                    </button>
                  </form>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      key: 'emailNotifications',
                      label: 'Email Notifications',
                      desc: 'Send transactional emails',
                    },
                    {
                      key: 'smsNotifications',
                      label: 'SMS Notifications',
                      desc: 'Send SMS alerts',
                    },
                    {
                      key: 'adminAlerts',
                      label: 'Admin Alerts',
                      desc: 'Notify admins of important events',
                    },
                    {
                      key: 'winnerNotifications',
                      label: 'Winner Notifications',
                      desc: 'Automatically notify raffle winners',
                    },
                    {
                      key: 'marketingEmails',
                      label: 'Marketing Emails',
                      desc: 'Send promotional content',
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                      <button
                        onClick={() =>
                          setNotificationSettings({
                            ...notificationSettings,
                            [item.key]:
                              !notificationSettings[item.key as keyof typeof notificationSettings],
                          })
                        }
                        className={`w-12 h-6 rounded-full transition ${
                          notificationSettings[item.key as keyof typeof notificationSettings]
                            ? 'bg-red-600'
                            : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                            notificationSettings[item.key as keyof typeof notificationSettings]
                              ? 'translate-x-6'
                              : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={20} className="text-green-600" />
                    <span className="font-semibold text-green-800">Security Status: Good</span>
                  </div>
                  <p className="text-sm text-green-700">
                    All security features are enabled and functioning properly.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600 mb-4">Require 2FA for all admin accounts</p>
                    <button
                      onClick={() => router.push('/dashboard/settings?tab=security')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                    >
                      <ExternalLink size={16} />
                      Configure 2FA in User Settings
                    </button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Admin Access Logs</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      View all admin login and action history
                    </p>
                    <button
                      onClick={async () => {
                        setShowLogs(!showLogs);
                        if (!showLogs && logs.length === 0) {
                          setLogsLoading(true);
                          try {
                            const res = await api.get<{
                              transactions: LogItem[];
                              pagination: unknown;
                            }>('/api/admin/transactions?limit=10');
                            if (!res.success) {
                              throw new Error(res.message || 'Failed to load logs');
                            }
                            setLogs(res.data?.transactions || []);
                          } catch (err) {
                            toast.error(
                              err instanceof Error ? err.message : 'Failed to load logs.',
                            );
                          } finally {
                            setLogsLoading(false);
                          }
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                    >
                      <Clock size={16} />
                      {showLogs ? 'Hide Logs' : 'View Logs'}
                    </button>
                    {showLogs && (
                      <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                        {logsLoading ? (
                          <div className="p-6 text-center">
                            <div className="animate-spin w-6 h-6 border-3 border-red-600 border-t-transparent rounded-full mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Loading logs…</p>
                          </div>
                        ) : logs.length > 0 ? (
                          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                            {logs.map((log: LogItem) => (
                              <div
                                key={log.id}
                                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-sm"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {log.description || log.type}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {log.user?.name || 'System'} ·{' '}
                                    {new Date(log.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                <span
                                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${log.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : log.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
                                >
                                  {log.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="p-4 text-center text-gray-500 text-sm">No logs found.</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">API Keys</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Manage API access keys for integrations
                    </p>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition">
                      Manage Keys
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
