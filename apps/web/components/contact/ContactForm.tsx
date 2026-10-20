'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Icon from '@/components/ui/Icon';

export function ContactForm({ isPreview }: { isPreview: boolean }) {
  const t = useTranslations('Contact');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'preview' | 'error'>('idle');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Design preview: nothing is sent anywhere; say so instead of pretending.
    if (isPreview) {
      setStatus('preview');
      setFormData({ name: '', email: '', message: '' });
      return;
    }
    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send message');

      setEmailSent(data.userEmailSent === true);
      setStatus(data.preview ? 'preview' : 'success');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (status === 'success' || status === 'preview') {
    return (
      <div role="status" className="border border-ink p-8 md:p-10">
        <Icon name="mail" size={28} className="text-accent" />
        <h2 className="mt-5 font-serif text-2xl font-semibold">{status === 'preview' ? t('previewTitle') : t('success')}</h2>
        <p className="mt-3 leading-relaxed text-ink-soft">{status === 'preview' ? t('previewBody') : t('successBody')}</p>
        {status === 'success' && emailSent && <p className="mt-2 text-sm text-ink-soft">{t('successMail')}</p>}
        <button type="button" onClick={() => setStatus('idle')} className="mt-8 inline-flex min-h-[48px] items-center gap-2 border border-ink px-5 text-[0.9375rem] hover:bg-ink hover:text-paper">
          {t('again')}
        </button>
      </div>
    );
  }

  const field = 'w-full border-0 border-b border-ink/40 bg-transparent px-0 py-3 text-[1.0625rem] text-ink placeholder:text-ink-mute/70 focus:border-accent focus:outline-none focus:ring-0';

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate={false}>
      <h2 className="font-serif text-2xl font-semibold">{t('formTitle')}</h2>
      {status === 'error' && (
        <p role="alert" className="border-l-2 border-accent bg-accent/5 px-4 py-3 text-[0.9375rem] text-accent">{t('error')}</p>
      )}
      <div className="grid gap-8 md:grid-cols-2">
        <label className="block">
          <span className="label text-ink-mute">{t('name')}</span>
          <input type="text" name="name" autoComplete="name" value={formData.name} onChange={handleChange} required placeholder={t('namePlaceholder')} className={`form-input ${field}`} />
        </label>
        <label className="block">
          <span className="label text-ink-mute">{t('email')}</span>
          <input type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} required placeholder={t('emailPlaceholder')} className={`form-input ${field}`} />
        </label>
      </div>
      <label className="block">
        <span className="label text-ink-mute">{t('message')}</span>
        {/* ruled like letter paper */}
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={7}
          placeholder={t('messagePlaceholder')}
          className="form-textarea mt-2 w-full resize-y border border-ink/30 bg-[linear-gradient(transparent_calc(2.25rem-1px),rgb(var(--grid-line)/0.25)_calc(2.25rem-1px))] bg-[length:100%_2.25rem] bg-local px-4 py-[0.4rem] text-[1.0625rem] leading-[2.25rem] text-ink placeholder:text-ink-mute/70 focus:border-accent focus:outline-none focus:ring-0"
        />
      </label>
      {isPreview && (
        <p className="flex gap-3 bg-paper-deep px-4 py-3 text-[0.875rem] leading-relaxed text-ink-soft">
          <Icon name="sparkle" size={16} className="mt-0.5 shrink-0 text-accent" />
          <span><strong className="font-semibold text-ink">{t('previewTitle')}.</strong> {t('previewBody')}</span>
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex min-h-[52px] items-center gap-3 bg-ink px-8 text-[0.9375rem] text-paper transition-colors hover:bg-accent disabled:opacity-50"
      >
        {status === 'loading' ? t('sending') : t('send')} <Icon name="arrowRight" size={16} />
      </button>
    </form>
  );
}
