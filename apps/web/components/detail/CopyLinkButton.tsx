'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Icon from '@/components/ui/Icon';

export default function CopyLinkButton({ className }: { className: string }) {
  const t = useTranslations('Detail');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <button type="button" onClick={copy} className={className} aria-label={t('copy')} title={t('copy')}>
      <Icon name="link" size={18} />
      <span role="status" aria-live="polite" className={copied ? 'text-[0.8125rem]' : 'sr-only'}>
        {copied ? t('copied') : ''}
      </span>
    </button>
  );
}
