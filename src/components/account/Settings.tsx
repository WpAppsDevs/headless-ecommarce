'use client';

import { useState, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { UserProfile } from '@/lib/api/checkout';

interface SettingsTabProps {
  profile: UserProfile | null;
}

export function SettingsTab({ profile }: SettingsTabProps) {
  const [form, setForm] = useState({
    firstName: profile?.first_name || '',
    lastName:  profile?.last_name  || '',
    phone:     profile?.billing?.phone || '',
    email:     profile?.email || '',
  });

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow]           = useState({ current: false, newPass: false, confirm: false });
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFileName, setAvatarFileName] = useState<string>('No file chosen');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setAvatarFileName(file.name);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPass && passwords.newPass !== passwords.confirm) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      // TODO: call profile update / password change API
      await new Promise(r => setTimeout(r, 600));
      setMsg({ type: 'success', text: 'Changes saved successfully!' });
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  };

  const initials =
    [profile?.first_name?.[0], profile?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?';

  const inputClass =
    'w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-zinc-500 placeholder:text-zinc-300';

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-zinc-900">Setting</h2>

      <form onSubmit={handleSave}>
        <div className="rounded-xl border border-zinc-200 bg-white p-7">
          {/* Alert */}
          {msg && (
            <div
              className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${
                msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}
            >
              {msg.text}
            </div>
          )}

          {/* ── Information ─────────────────────── */}
          <h3 className="mb-5 text-base font-semibold text-zinc-900">Infomation</h3>

          {/* Avatar upload */}
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-zinc-700">
              Upload Avatar <span className="text-red-500">*</span>
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 transition-colors hover:bg-zinc-200"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-zinc-600">{initials}</span>
                )}
              </button>
              <div>
                <p className="text-sm font-medium text-zinc-900">Upload File</p>
                <p className="mb-2 text-xs text-zinc-400">JPG 80x90px</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                  >
                    Choose File
                  </button>
                  <span className="text-xs text-zinc-400">{avatarFileName}</span>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* Name row */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                placeholder="First Name"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                placeholder="Last Name"
                className={inputClass}
              />
            </div>
          </div>

          {/* Phone + Email row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="Phone Number"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="Email Address"
                className={inputClass}
              />
            </div>
          </div>

          {/* ── Change Password ──────────────────── */}
          <div className="my-7 border-t border-zinc-100" />
          <h3 className="mb-5 text-base font-semibold text-zinc-900">Change Password</h3>

          <div className="space-y-4">
            {/* Current */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Current password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={show.current ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                  placeholder="Current password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShow(p => ({ ...p, current: !p.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  aria-label={show.current ? 'Hide password' : 'Show password'}
                >
                  {show.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                New password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={show.newPass ? 'text' : 'password'}
                  value={passwords.newPass}
                  onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                  placeholder="New password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShow(p => ({ ...p, newPass: !p.newPass }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  aria-label={show.newPass ? 'Hide password' : 'Show password'}
                >
                  {show.newPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                Confirm new password: <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={show.confirm ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Confirm new password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShow(p => ({ ...p, confirm: !p.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  aria-label={show.confirm ? 'Hide password' : 'Show password'}
                >
                  {show.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={saving}
            className="mt-7 rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Change'}
          </button>
        </div>
      </form>
    </div>
  );
}
