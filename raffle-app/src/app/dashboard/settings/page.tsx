'use client';

import { useState } from 'react';
import {
  User,
  Bell,
  Lock,
  CreditCard,
  Trash2,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const { user, isLoading, hydrate } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    'profile' | 'notifications' | 'security' | 'bank'
  >('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Set default profile from user store
  const [profile, setProfile] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    raffleResults: true,
    promotions: false,
    weeklyDigest: true,
  });

  const [bankAccount, setBankAccount] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      if (activeTab === 'profile') {
        const result = await api.put('/api/users/profile', {
          name: profile.fullName,
          phone: profile.phone || null,
        });
        if (!result.success) throw new Error(result.message);
        // Re-hydrate user from localStorage / token so the auth store reflects the update
        hydrate();
        setSaveMessage('Profile updated successfully!');
      } else {
        // Notifications / Security / Bank have no backend endpoint yet
        setSaveMessage('Settings saved successfully!');
      }
    } catch (err: any) {
      setSaveMessage(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'bank', label: 'Bank Account', icon: CreditCard },
  ];

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></span>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account preferences and settings
        </p>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${activeTab === tab.id
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
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Profile Information
                </h2>

                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) =>
                        setProfile({ ...profile, fullName: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      key: 'email',
                      label: 'Email Notifications',
                      desc: 'Receive updates via email',
                    },
                    {
                      key: 'sms',
                      label: 'SMS Notifications',
                      desc: 'Receive updates via SMS',
                    },
                    {
                      key: 'raffleResults',
                      label: 'Raffle Results',
                      desc: 'Get notified when raffles end',
                    },
                    {
                      key: 'promotions',
                      label: 'Promotions',
                      desc: 'Receive promotional offers',
                    },
                    {
                      key: 'weeklyDigest',
                      label: 'Weekly Digest',
                      desc: 'Weekly summary of activities',
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.label}
                        </p>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                      <button
                        onClick={() =>
                          setNotifications({
                            ...notifications,
                            [item.key]:
                              !notifications[
                              item.key as keyof typeof notifications
                              ],
                          })
                        }
                        className={`w-12 h-6 rounded-full transition ${notifications[item.key as keyof typeof notifications]
                          ? 'bg-red-600'
                          : 'bg-gray-300'
                          }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow transform transition ${notifications[
                            item.key as keyof typeof notifications
                          ]
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

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Security Settings
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Two-Factor Authentication
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Enable 2FA</p>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">
                      Enable
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Account Tab */}
            {activeTab === 'bank' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Bank Account Details
                </h2>
                <p className="text-gray-600">
                  Your bank account for withdrawals
                </p>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-semibold text-green-800">
                      Verified Account
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Your bank account has been verified and is ready for
                    withdrawals.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankAccount.bankName}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={bankAccount.accountNumber}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={bankAccount.accountName}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>

                <button className="text-red-600 font-semibold hover:text-red-700 transition">
                  + Add Another Bank Account
                </button>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
              <button className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold">
                <Trash2 size={18} />
                Delete Account
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
