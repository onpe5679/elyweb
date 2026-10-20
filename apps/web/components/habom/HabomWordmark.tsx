// Typographic stand-in for the Habom Studio logo. No official logo was found in the project or
// on the live site, so this is a plainly set wordmark marked as temporary wherever it appears.
export default function HabomWordmark({ localName, size = 'md' }: { localName: string; size?: 'md' | 'lg' }) {
  const lg = size === 'lg';
  return (
    <span className="inline-flex items-center gap-2.5">
      <span aria-hidden="true" className={`relative inline-block ${lg ? 'h-10 w-10' : 'h-7 w-7'}`}>
        <span className="absolute inset-0 rounded-full bg-petal" />
        <span className={`absolute rounded-full bg-butter ${lg ? '-bottom-1 -right-1 h-5 w-5' : '-bottom-0.5 -right-0.5 h-3.5 w-3.5'} ring-2 ring-cream`} />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-round-latin font-extrabold tracking-[0.02em] text-plum ${lg ? 'text-2xl' : 'text-[1.0625rem]'}`}>habom studio</span>
        <span className={`font-round text-plum-soft ${lg ? 'mt-1 text-base' : 'mt-0.5 text-[0.75rem]'}`}>{localName}</span>
      </span>
    </span>
  );
}
