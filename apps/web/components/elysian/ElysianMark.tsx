// The official Studio Elysian mark (book + star). The ink version is a recolour of the
// white mark stored in company_settings.logo_icon, for use on paper backgrounds.
export default function ElysianMark({ tone = 'ink', className = '' }: { tone?: 'ink' | 'paper'; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/brand/elysian-mark-${tone}.png`} alt="" width={256} height={256} className={`select-none object-contain ${className}`} />
  );
}
