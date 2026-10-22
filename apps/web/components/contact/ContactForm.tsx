'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ContactFormProps {
  inquiryLabel: string;
}

// Underline fields on paper. The focus outline is set explicitly because the
// Tailwind forms plugin hides outlines on text inputs.
const fieldClass =
  'mt-3 block w-full rounded-none border-0 border-b border-ink bg-transparent px-0 py-3 text-base text-ink placeholder:text-ink-3 transition-colors focus:border-seal focus:ring-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-seal focus-visible:outline-offset-[3px]';
const labelClass = 'block text-xs font-bold uppercase tracking-[0.16em] text-ink-3';

export function ContactForm({ inquiryLabel }: ContactFormProps) {
  const t = useTranslations('ContactForm');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errorFallback'));
      }

      setEmailSent(data.userEmailSent === true);
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : t('errorFallback'));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (status === 'success') {
    return (
      <div role="status" className="border-l-2 border-seal pl-6">
        <i className="fa-solid fa-check text-2xl text-seal" aria-hidden="true"></i>
        <h2 className="font-display mt-6 text-3xl leading-tight text-ink md:text-4xl">{t('successTitle')}</h2>
        <p className="mt-4 leading-relaxed text-ink-2">{t('successBody')}</p>
        {emailSent && (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-3">
            <i className="fa-solid fa-envelope text-seal" aria-hidden="true"></i>
            {t('successEmail')}
          </p>
        )}
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-10 border-b border-ink pb-1 text-sm font-bold text-ink transition-colors hover:border-seal hover:text-seal"
        >
          {t('sendAnother')}
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="font-display text-3xl leading-tight text-ink md:text-4xl">{inquiryLabel}</h2>
      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        {status === 'error' && (
          <div role="alert" className="border-l-2 border-seal bg-seal-soft p-4">
            <p className="text-sm text-ink">{errorMessage}</p>
          </div>
        )}
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            {t('nameLabel')}
          </label>
          <input
            id="contact-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder={t('namePlaceholder')}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            {t('emailLabel')}
          </label>
          <input
            id="contact-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder={t('emailPlaceholder')}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="contact-message" className={labelClass}>
            {t('messageLabel')}
          </label>
          <textarea
            id="contact-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            placeholder={t('messagePlaceholder')}
            className={`${fieldClass} resize-y`}
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-ink w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'loading' ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
              {t('sending')}
            </>
          ) : (
            t('submit')
          )}
        </button>
      </form>
    </>
  );
}
