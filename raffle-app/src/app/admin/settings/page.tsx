'use client';

import { useState } from 'react';
import {
  Settings,
  Globe,
  CreditCard,
  Bell,
  Users,
  Save,
  Shield,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    'general' | 'payment' | 'notifications' | 'security'
  >('general');
  const [isSaving, setIsSaving] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'RaffleHub',
    siteDescription: 'Win big, play fair',
    supportEmail: 'support@rafflehub.ng',
    supportPhone: '+234 800 123 4567',
    maintenanceMode: false,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    paystackPublicKey: 'pk_test_xxxxxxxxxxxxx',
    paystackSecretKey: 'sk_test_xxxxxxxxxxxxx',
    minDeposit: 100,
    maxDeposit: 5000000,
    minWithdrawal: 1000,
    withdrawalFeePercent: 1,
    commissionPercent: 10,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    adminAlerts: true,
    winnerNotifications: true,
    marketingEmails: false,
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1500);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600">
          Configure your platform settings and preferences
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
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  General Settings
                </h2>

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
                      <p className="font-semibold text-gray-900">
                        Maintenance Mode
                      </p>
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
                        generalSettings.maintenanceMode
                          ? 'bg-red-600'
                          : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                          generalSettings.maintenanceMode
                            ? 'translate-x-6'
                            : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Payment Settings
                </h2>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Paystack Integration:</strong> Configure your
                    Paystack API keys to enable payments.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Paystack Public Key
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.paystackPublicKey}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          paystackPublicKey: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Paystack Secret Key
                    </label>
                    <input
                      type="password"
                      value={paymentSettings.paystackSecretKey}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          paystackSecretKey: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 font-mono text-sm"
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Transaction Limits
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Min Deposit (₦)
                        </label>
                        <input
                          type="number"
                          value={paymentSettings.minDeposit}
                          onChange={(e) =>
                            setPaymentSettings({
                              ...paymentSettings,
                              minDeposit: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Max Deposit (₦)
                        </label>
                        <input
                          type="number"
                          value={paymentSettings.maxDeposit}
                          onChange={(e) =>
                            setPaymentSettings({
                              ...paymentSettings,
                              maxDeposit: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Min Withdrawal (₦)
                        </label>
                        <input
                          type="number"
                          value={paymentSettings.minWithdrawal}
                          onChange={(e) =>
                            setPaymentSettings({
                              ...paymentSettings,
                              minWithdrawal: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Withdrawal Fee (%)
                        </label>
                        <input
                          type="number"
                          value={paymentSettings.withdrawalFeePercent}
                          onChange={(e) =>
                            setPaymentSettings({
                              ...paymentSettings,
                              withdrawalFeePercent: parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Platform Commission (%)
                    </label>
                    <input
                      type="number"
                      value={paymentSettings.commissionPercent}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          commissionPercent: parseFloat(e.target.value),
                        })
                      }
                      className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Commission charged on each raffle ticket sold
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Notification Settings
                </h2>

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
                        <p className="font-semibold text-gray-900">
                          {item.label}
                        </p>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                      <button
                        onClick={() =>
                          setNotificationSettings({
                            ...notificationSettings,
                            [item.key]:
                              !notificationSettings[
                                item.key as keyof typeof notificationSettings
                              ],
                          })
                        }
                        className={`w-12 h-6 rounded-full transition ${
                          notificationSettings[
                            item.key as keyof typeof notificationSettings
                          ]
                            ? 'bg-red-600'
                            : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                            notificationSettings[
                              item.key as keyof typeof notificationSettings
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

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Security Settings
                </h2>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={20} className="text-green-600" />
                    <span className="font-semibold text-green-800">
                      Security Status: Good
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    All security features are enabled and functioning properly.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Require 2FA for all admin accounts
                    </p>
                    <button className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">
                      Configure 2FA
                    </button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Admin Access Logs
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      View all admin login and action history
                    </p>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition">
                      View Logs
                    </button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      API Keys
                    </h3>
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
