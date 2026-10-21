import { useTranslations } from 'next-intl';

/** 작품 상태(출시/개발 중 등) 라벨 */
export default function StatusMarker({ status, className = '' }: { status: string; className?: string }) {
  const t = useTranslations('Status');
  const known = ['released', 'coming_soon', 'in_development', 'publishing'].includes(status);
  const accent = status === 'released';
  return <span className={`marker ${accent ? 'marker--accent' : 'marker--outline'} ${className}`}>{known ? t(status) : status}</span>;
}
