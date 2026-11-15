'use client';

import { useState } from 'react';

/** 메일 주소 복사 버튼(메일 앱이 없는 환경을 위해). */
export default function CopyEmail({ email, label, done }: { email: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      window.prompt(label, email);
    }
  };
  return (
    <button type="button" onClick={copy} className="btn btn--ghost" aria-live="polite">
      {copied ? done : label}
    </button>
  );
}
