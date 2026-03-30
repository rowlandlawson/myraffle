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
  Shield,
  Mail,
  Smartphone,
} from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, isLoading, hydrate } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    'profile' | 'notifications' | 'security'
  >('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.twoFactorEnabled || false);
  const [twoFAStep, setTwoFAStep] = useState<'idle' | 'choose' | 'setup' | 'confirm' | 'disable'>('idle');
  const [twoFAMethod, setTwoFAMethod] = useState<'EMAIL' | 'TOTP'>('EMAIL');
  const [twoFAQRCode, setTwoFAQRCode] = useState<string | null>(null);
  const [twoFASecret, setTwoFASecret] = useState<string | null>(null);
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');

  const handleSetup2FA = async (method: 'EMAIL' | 'TOTP') => {
    setTwoFALoading(true);
    setTwoFAMethod(method);
    try {
      const result = await api.post<{ method: string; qrCode?: string; secret?: string }>('/api/auth/2fa/setup', { method });
      if (!result.success) throw new Error(result.message);
      if (method === 'TOTP' && result.data) {
        setTwoFAQRCode(result.data.qrCode || null);
        setTwoFASecret(result.data.secret || null);
      }
      setTwoFAStep('confirm');
      toast.success(result.message);
    } catch (err: any) {
      toast.error(err.message || 'Failed to start 2FA setup.');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleConfirm2FA = async () => {
    if (!twoFACode || twoFACode.length < 6) {
      toast.error('Enter a valid 6-digit code.');
      return;
    }
    setTwoFALoading(true);
    try {
      const result = await api.post('/api/auth/2fa/confirm', { code: twoFACode });
      if (!result.success) throw new Error(result.message);
      setIs2FAEnabled(true);
      setTwoFAStep('idle');
      setTwoFACode('');
      setTwoFAQRCode(null);
      setTwoFASecret(null);
      hydrate();
      toast.success('2FA enabled successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Invalid code.');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disablePassword) {
      toast.error('Password is required to disable 2FA.');
      return;
    }
    setTwoFALoading(true);
    try {
      const result = await api.post('/api/auth/2fa/disable', { password: disablePassword });
      if (!result.success) throw new Error(result.message);
      setIs2FAEnabled(false);
      setTwoFAStep('idle');
      setDisablePassword('');
      hydrate();
      toast.success('2FA has been disabled.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to disable 2FA.');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    let successCount = 0;

    try {
      if (activeTab === 'profile') {
        const result = await api.put('/api/users/profile', {
          name: profile.fullName,
          phone: profile.phone || null,
        });
        if (!result.success) throw new Error(result.message);
        hydrate();
        toast.success('Profile updated successfully!');
      } else if (activeTab === 'security') {
        if (securityData.currentPassword && securityData.newPassword) {
          if (securityData.newPassword !== securityData.confirmPassword) {
            throw new Error('New passwords do not match');
          }

          if (securityData.newPassword.length < 6) {
             throw new Error('Password must be at least 6 characters');
          }

          const result = await api.put('/api/users/change-password', {
            currentPassword: securityData.currentPassword,
            newPassword: securityData.newPassword,
          });

          if (!result.success) throw new Error(result.message);
          
          setSecurityData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
          toast.success('Password changed successfully!');
        } else if (securityData.currentPassword || securityData.newPassword) {
           throw new Error('Please fill in both current and new passwords to change it.');
        } else {
           toast.success('Security settings saved!');
        }
      } else {
        toast.success('Settings saved successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };




  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'bank', label: 'Bank Account', icon: CreditCard, disabled: true },
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
                  disabled={tab.disabled}
                  onClick={() => !tab.disabled && setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition ${
                    activeTab === tab.id
                      ? 'bg-red-50 text-red-600 font-semibold'
                      : tab.disabled
                      ? 'opacity-50 cursor-not-allowed text-gray-400'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon size={20} />
                    {tab.label}
                  </div>
                  {tab.disabled && <Lock size={14} className="text-gray-400" />}
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
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
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
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield size={18} />
                    Two-Factor Authentication
                  </h3>

                  {/* Status card */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {is2FAEnabled ? '2FA is Active' : '2FA is Disabled'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {is2FAEnabled
                          ? `Using ${user?.twoFactorMethod === 'TOTP' ? 'Authenticator App' : 'Email OTP'}`
                          : 'Add an extra layer of security to your account'}
                      </p>
                    </div>
                    {is2FAEnabled ? (
                      <button
                        onClick={() => setTwoFAStep('disable')}
                        className="px-4 py-2 font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                      >
                        Disable
                      </button>
                    ) : (
                      <button
                        onClick={() => setTwoFAStep('choose')}
                        className="px-4 py-2 font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                      >
                        Enable
                      </button>
                    )}
                  </div>

                  {/* Method selection */}
                  {twoFAStep === 'choose' && (
                    <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-semibold text-gray-700">Choose your 2FA method:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={() => handleSetup2FA('EMAIL')}
                          disabled={twoFALoading}
                          className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-red-400 hover:bg-red-50/30 transition disabled:opacity-50"
                        >
                          <Mail size={24} className="text-red-600" />
                          <div className="text-left">
                            <p className="font-semibold text-gray-900">Email OTP</p>
                            <p className="text-xs text-gray-500">Code sent to your email on each login</p>
                          </div>
                        </button>
                        <button
                          onClick={() => handleSetup2FA('TOTP')}
                          disabled={twoFALoading}
                          className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-red-400 hover:bg-red-50/30 transition disabled:opacity-50"
                        >
                          <Smartphone size={24} className="text-red-600" />
                          <div className="text-left">
                            <p className="font-semibold text-gray-900">Authenticator App</p>
                            <p className="text-xs text-gray-500">Google Authenticator, Authy, etc.</p>
                          </div>
                        </button>
                      </div>
                      <button
                        onClick={() => setTwoFAStep('idle')}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Confirm step */}
                  {twoFAStep === 'confirm' && (
                    <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                      {twoFAMethod === 'TOTP' && twoFAQRCode && (
                        <div className="text-center space-y-3">
                          <p className="text-sm font-semibold text-gray-700">
                            Scan this QR code with your authenticator app:
                          </p>
                          <img
                            src={twoFAQRCode}
                            alt="2FA QR Code"
                            className="mx-auto w-48 h-48 border rounded-lg"
                          />
                          {twoFASecret && (
                            <div className="bg-gray-100 p-2 rounded text-xs font-mono text-gray-600 break-all">
                              Manual key: {twoFASecret}
                            </div>
                          )}
                        </div>
                      )}
                      {twoFAMethod === 'EMAIL' && (
                        <p className="text-sm text-gray-600">
                          A 6-digit verification code has been sent to <strong>{user?.email}</strong>.
                        </p>
                      )}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Enter verification code
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={twoFACode}
                          onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl font-mono tracking-widest focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleConfirm2FA}
                          disabled={twoFALoading || twoFACode.length < 6}
                          className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                          {twoFALoading ? 'Verifying...' : 'Confirm & Enable'}
                        </button>
                        <button
                          onClick={() => { setTwoFAStep('idle'); setTwoFACode(''); }}
                          className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Disable step */}
                  {twoFAStep === 'disable' && (
                    <div className="border border-red-200 bg-red-50/30 rounded-xl p-4 space-y-4">
                      <p className="text-sm text-gray-700">
                        Enter your password to disable two-factor authentication.
                      </p>
                      <input
                        type="password"
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                        placeholder="Your current password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleDisable2FA}
                          disabled={twoFALoading || !disablePassword}
                          className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                          {twoFALoading ? 'Disabling...' : 'Disable 2FA'}
                        </button>
                        <button
                          onClick={() => { setTwoFAStep('idle'); setDisablePassword(''); }}
                          className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
