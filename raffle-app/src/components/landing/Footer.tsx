'use client';

import TermsModal from '@/components/terms/TermsModal';
import { api } from '@/lib/api';
import { ChevronDown, Mail, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

const SOCIAL_LABELS: Record<string, string> = {
  twitter: 'Twitter / X',
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

export default function Footer() {
  const [termsOpen, setTermsOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [contacts, setContacts] = useState<{
    supportEmail?: string;
    supportPhone?: string;
  }>({});
  const [showContactDropdown, setShowContactDropdown] = useState(false);

  useEffect(() => {
    // Fetch social links and general settings (contacts)
    Promise.all([
      api.get<{ value?: string }>('/api/settings/social_links'),
      api.get<{ value?: string }>('/api/settings/general_settings'),
    ])
      .then(([socialRes, generalRes]) => {
        if (socialRes.success && socialRes.data?.value) {
          try {
            setSocialLinks(JSON.parse(socialRes.data.value));
          } catch (e) {
            console.error('Failed to parse social links', e);
          }
        }
        if (generalRes.success && generalRes.data?.value) {
          try {
            setContacts(JSON.parse(generalRes.data.value));
          } catch (e) {
            console.error('Failed to parse general settings', e);
          }
        }
      })
      .catch(() => {});
  }, []);

  const activeSocials = Object.entries(socialLinks).filter(
    ([_, url]) => typeof url === 'string' && url.trim().length > 0,
  );

  const hasContacts = Boolean(
    (contacts.supportEmail && contacts.supportEmail.trim().length > 0) ||
      (contacts.supportPhone && contacts.supportPhone.trim().length > 0),
  );

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#E10600] text-white py-12 px-5 sm:px-8 mt-12">
      <div
        className={`max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 ${activeSocials.length > 0 ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-8 mb-10`}
      >
        {/* Brand Column */}
        <div className="space-y-3">
          <Link href="/" className="inline-block bg-white p-3.5 sm:p-5 rounded-2xl shadow-md">
            <Image
              src="/images/logo.png"
              alt="myRaffle Logo"
              width={260}
              height={90}
              className="h-10 sm:h-14 md:h-16 lg:h-20 w-auto object-contain"
            />
          </Link>
          <p className="text-white/90 text-sm font-medium">Win big, play fair.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-base text-white mb-3 tracking-wide">Quick Links</h4>
          <ul className="space-y-2 text-white/85 text-sm font-medium">
            <li>
              <a href="#how" className="hover:text-yellow-300 transition-colors">
                How It Works
              </a>
            </li>
          </ul>
        </div>

        {/* Legal & Contacts */}
        <div>
          <h4 className="font-bold text-base text-white mb-3 tracking-wide">Legal</h4>
          <ul className="space-y-2 text-white/85 text-sm font-medium">
            <li>
              <button
                onClick={() => setTermsOpen(true)}
                className="hover:text-yellow-300 transition-colors text-left cursor-pointer"
              >
                Terms of Service
              </button>
            </li>
            <li>
              <button
                onClick={() => setTermsOpen(true)}
                className="hover:text-yellow-300 transition-colors text-left cursor-pointer"
              >
                Privacy Policy
              </button>
            </li>

            {/* Dynamic Contact Us Dropdown (Hidden if admin left no contacts) */}
            {hasContacts && (
              <li className="relative">
                <button
                  onClick={() => setShowContactDropdown(!showContactDropdown)}
                  className="hover:text-yellow-300 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <span>Contact Us</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${showContactDropdown ? 'rotate-180 text-yellow-300' : ''}`}
                  />
                </button>

                {showContactDropdown && (
                  <div className="mt-2 p-2.5 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-100 space-y-1.5 text-xs animate-in fade-in slide-in-from-top-1 duration-200 max-w-xs">
                    {contacts.supportEmail && (
                      <a
                        href={`mailto:${contacts.supportEmail}`}
                        className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-red-50 text-red-600 font-semibold rounded-lg transition"
                      >
                        <Mail size={14} className="shrink-0" />
                        <span className="truncate">{contacts.supportEmail}</span>
                      </a>
                    )}
                    {contacts.supportPhone && (
                      <a
                        href={`tel:${contacts.supportPhone}`}
                        className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-emerald-50 text-emerald-600 font-semibold rounded-lg transition"
                      >
                        <Phone size={14} className="shrink-0" />
                        <span className="truncate">{contacts.supportPhone}</span>
                      </a>
                    )}
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>

        {/* Follow Us (Dynamically Rendered / Hidden if empty) */}
        {activeSocials.length > 0 && (
          <div>
            <h4 className="font-bold text-base text-white mb-3 tracking-wide">Follow Us</h4>
            <ul className="space-y-2 text-white/85 text-sm font-medium">
              {activeSocials.map(([platform, url]) => (
                <li key={platform}>
                  <a
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-yellow-300 transition-colors capitalize"
                  >
                    {SOCIAL_LABELS[platform] || platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-white/20 pt-6 text-center text-white/80 text-sm">
        <p>&copy; {currentYear} myRaffle. All rights reserved.</p>
      </div>

      {/* Terms & Conditions Modal */}
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
    </footer>
  );
}
