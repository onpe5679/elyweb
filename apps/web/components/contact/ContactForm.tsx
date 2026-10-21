'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { AlertIcon, CheckIcon } from '@/components/pages/Icons';

type Field = 'name' | 'email' | 'message';
type Values = Record<Field, string>;
type ErrorCode = 'nameRequired' | 'emailRequired' | 'emailInvalid' | 'messageRequired';
type Errors = Partial<Record<Field, ErrorCode>>;
type Status = 'idle' | 'loading' | 'success' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // /api/contact 와 같은 규칙
const ORDER: Field[] = ['name', 'email', 'message'];

function check(field: Field, value: string): ErrorCode | undefined {
  const v = value.trim();
  if (field === 'name') return v ? undefined : 'nameRequired';
  if (field === 'email') return !v ? 'emailRequired' : EMAIL_RE.test(v) ? undefined : 'emailInvalid';
  return v ? undefined : 'messageRequired';
}

/**
 * 문의 양식. POST /api/contact (JSON).
 * - 입력 검증은 브라우저 기본 말풍선 대신 필드 아래 문구로 보여 주고(aria-invalid/aria-describedby), 첫 오류 필드에 초점을 옮긴다.
 * - 환경변수가 없는 미리보기 서버는 {success:true, preview:true} 를 돌려준다 → 성공 화면 + "실제로 발송되지 않음" 안내.
 */
export function ContactForm({ contactEmail }: { contactEmail?: string }) {
  const t = useTranslations('Contact.form');
  const uid = useId();
  const ids = { name: `${uid}-name`, email: `${uid}-email`, message: `${uid}-message` };
  const refs = { name: useRef<HTMLInputElement>(null), email: useRef<HTMLInputElement>(null), message: useRef<HTMLTextAreaElement>(null) };
  const doneRef = useRef<HTMLDivElement>(null);

  const [values, setValues] = useState<Values>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [preview, setPreview] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // 성공 화면으로 바뀌면 스크린 리더가 읽도록 초점을 옮긴다.
  useEffect(() => {
    if (status === 'success') doneRef.current?.focus();
  }, [status]);

  const onChange = (field: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
    // 이미 오류가 표시된 필드만 입력 즉시 다시 검사해서, 고치면 바로 사라지게 한다.
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: check(field, value) }));
  };

  const onBlur = (field: Field) => () => {
    if (values[field] === '' && !errors[field]) return; // 지나가기만 한 빈 칸은 건드리지 않는다
    setErrors((prev) => ({ ...prev, [field]: check(field, values[field]) }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;

    const found: Errors = {};
    for (const f of ORDER) {
      const code = check(f, values[f]);
      if (code) found[f] = code;
    }
    setErrors(found);
    const first = ORDER.find((f) => found[f]);
    if (first) {
      setStatus('idle');
      refs[first].current?.focus();
      return;
    }

    // 정적 미리보기 빌드에는 API 라우트가 없다 → 요청을 보내지 않고 곧바로 "미리보기" 성공 화면으로 간다.
    if (process.env.NEXT_PUBLIC_STATIC_PREVIEW === '1') {
      setPreview(true);
      setConfirmed(false);
      setValues({ name: '', email: '', message: '' });
      setErrors({});
      setStatus('success');
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: values.name.trim(), email: values.email.trim(), message: values.message.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) throw new Error('send');

      setPreview(data.preview === true);
      setConfirmed(data.userEmailSent === true);
      setValues({ name: '', email: '', message: '' });
      setErrors({});
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div
        ref={doneRef}
        tabIndex={-1}
        role="status"
        data-testid={preview ? 'contact-preview' : 'contact-success'}
        className="scroll-mt-[calc(var(--header-h)+24px)] border border-ink bg-paper-3 p-8 outline-none md:p-10"
      >
        <div className="flex items-center gap-4">
          <span className={`grid h-14 w-14 shrink-0 place-items-center border border-ink ${preview ? 'bg-paper-3 text-ink' : 'bg-accent text-accent-ink'}`}>
            <CheckIcon />
          </span>
          <span className={`marker ${preview ? 'marker--outline' : 'marker--accent'}`}>{preview ? t('preview.badge') : t('success.badge')}</span>
        </div>
        <h2 className="t-display mt-6 break-keep text-[clamp(26px,3vw,38px)]">{preview ? t('preview.title') : t('success.title')}</h2>
        <p className="mt-4 max-w-md break-keep font-serif text-[16px] leading-8 text-ink-2">{preview ? t('preview.body') : t('success.body')}</p>
        {!preview && confirmed && <p className="mt-2 break-keep font-serif text-[15px] leading-7 text-ink-3">{t('success.confirmation')}</p>}
        <button type="button" onClick={() => setStatus('idle')} className="btn btn--ghost mt-8">
          {t('again')}
        </button>
      </div>
    );
  }

  const loading = status === 'loading';
  const hasErrors = ORDER.some((f) => errors[f]);

  const label = (field: Field, text: string) => (
    <label htmlFor={ids[field]} className="mb-2 flex items-baseline justify-between gap-3 text-[14px] font-bold">
      <span>{text}</span>
      <span className="font-mono text-[11px] font-normal uppercase tracking-wider text-ink-3">{t('required')}</span>
    </label>
  );

  const fieldError = (field: Field) =>
    errors[field] ? (
      <p id={`${ids[field]}-error`} className="mt-2 flex items-start gap-2 break-keep text-[14px] font-bold leading-6 text-accent-text">
        <AlertIcon className="mt-1 h-4 w-4 shrink-0" />
        <span>{t(`errors.${errors[field]}`)}</span>
      </p>
    ) : null;

  const common = (field: Field) => ({
    id: ids[field],
    name: field,
    value: values[field],
    onChange: onChange(field),
    onBlur: onBlur(field),
    'aria-required': true as const,
    'aria-invalid': errors[field] ? (true as const) : undefined,
    'aria-describedby': errors[field] ? `${ids[field]}-error` : undefined,
    className: `field ${errors[field] ? '!border-2 !border-accent-text' : ''}`,
  });

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={loading} className="space-y-7" data-testid="contact-form">
      <div>
        {label('name', t('name'))}
        <input ref={refs.name} type="text" autoComplete="name" {...common('name')} />
        {fieldError('name')}
      </div>
      <div>
        {label('email', t('email'))}
        <input ref={refs.email} type="email" inputMode="email" autoComplete="email" spellCheck={false} {...common('email')} />
        {fieldError('email')}
      </div>
      <div>
        {label('message', t('message'))}
        <textarea ref={refs.message} rows={7} {...common('message')} />
        {fieldError('message')}
      </div>

      {status === 'error' && (
        <div role="alert" className="flex items-start gap-3 border-2 border-accent-text p-4 text-[15px] leading-7" data-testid="contact-error">
          <AlertIcon className="mt-1 h-5 w-5 shrink-0 text-accent-text" />
          <p className="break-keep">
            {t('errors.send')}
            {contactEmail && (
              <>
                {' '}
                <a href={`mailto:${contactEmail}`} className="link-u break-all font-mono text-[14px] font-bold">{contactEmail}</a>
              </>
            )}
          </p>
        </div>
      )}

      <div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button type="submit" disabled={loading} className="btn disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:transform-none" data-testid="contact-submit">
            {loading ? t('sending') : t('submit')}
          </button>
          {/* 상태 안내(스크린 리더에는 polite 로 읽힌다) */}
          <p role="status" aria-live="polite" className="min-h-[1.5rem] break-keep text-[14px] font-bold text-ink-2">
            {loading ? t('sending') : hasErrors ? t('summary') : ''}
          </p>
        </div>
        <p className="mt-5 max-w-md break-keep text-[13px] leading-6 text-ink-3">
          {t.rich('consent', {
            link: (chunks) => (
              <Link href="/privacy" className="link-u font-bold text-ink-2 hover:text-ink">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    </form>
  );
}
