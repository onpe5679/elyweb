'use client';

import {useRef, useState} from 'react';
import {useTranslations} from 'next-intl';

type Choice = {label: string; next: string};
type Scene = {speaker?: string; text: string; choices?: Choice[]; ending?: string};

const START = 'start';

// Sample dialogue experience for Studio Habom title pages only. The script is a design sample, not official game content.
export default function HobomExperience() {
  const t = useTranslations('Hobom');
  const scenes = t.raw('scenes') as Record<string, Scene>;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState(START);
  const [step, setStep] = useState(1);
  const scene = scenes[current] ?? scenes[START];

  const open = () => {
    setCurrent(START);
    setStep(1);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const choose = (next: string) => {
    if (!scenes[next]) return;
    setCurrent(next);
    setStep((n) => n + 1);
  };
  const restart = () => {
    setCurrent(START);
    setStep(1);
  };

  return (
    <div>
      <h2 className="font-hobom text-3xl font-bold leading-tight md:text-4xl">{t('experienceTitle')}</h2>
      <p className="font-hobom mt-4 max-w-xl text-base leading-relaxed text-hb-ink/80">{t('experienceLead')}</p>
      <button
        type="button"
        onClick={open}
        className="font-hobom mt-8 inline-flex items-center gap-3 rounded-full bg-hb-pink px-7 py-4 text-sm font-bold text-hb-ink transition-colors hover:bg-hb-pink-deep hover:text-hb-cream"
      >
        {t('experienceOpen')}
        <span aria-hidden="true">→</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="hobom-experience-title"
        onClick={(e) => {
          // A click on the backdrop lands on the dialog element itself.
          if (e.target === dialogRef.current) close();
        }}
        className="font-hobom m-auto w-[calc(100%-2rem)] max-w-2xl rounded-[2rem] bg-hb-cream p-0 text-hb-ink shadow-2xl backdrop:bg-hb-ink/50 open:flex open:flex-col"
      >
        <div className="flex flex-col gap-8 p-6 md:p-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <span className="inline-block rounded-full bg-hb-yellow px-3 py-1 text-xs font-bold text-hb-ink">
                {t('experienceNotice')}
              </span>
              <h3 id="hobom-experience-title" className="mt-4 text-2xl font-bold">
                {t('experienceTitle')}
              </h3>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label={t('experienceClose')}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-hb-pink-soft text-lg transition-colors hover:bg-hb-pink hover:text-hb-ink"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div key={current} className="flex flex-col gap-6 animate-fade-in-up" aria-live="polite">
            <p className="text-sm font-bold text-hb-pink-deep">{t('experienceStep', {count: step})}</p>
            <div className="rounded-[1.5rem] bg-hb-pink-soft p-6 md:p-8">
              {scene.speaker && (
                <p className="mb-3 inline-block rounded-full bg-hb-ink px-4 py-1 text-sm font-bold text-hb-cream">
                  {scene.speaker}
                </p>
              )}
              <p className="text-lg leading-relaxed md:text-xl">{scene.text}</p>
            </div>

            {scene.ending ? (
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-base font-bold">{t('experienceEnding', {ending: scene.ending})}</p>
                <button
                  type="button"
                  onClick={restart}
                  className="rounded-full bg-hb-ink px-6 py-3 text-sm font-bold text-hb-cream transition-colors hover:bg-hb-pink-deep"
                >
                  {t('experienceRestart')}
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full border-2 border-hb-ink px-6 py-3 text-sm font-bold transition-colors hover:bg-hb-ink hover:text-hb-cream"
                >
                  {t('experienceClose')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-hb-ink/70">{t('experienceChoose')}</p>
                <ul className="flex flex-col gap-3">
                  {(scene.choices ?? []).map((choice, index) => (
                    <li key={choice.next + index}>
                      <button
                        type="button"
                        autoFocus={index === 0}
                        onClick={() => choose(choice.next)}
                        className="w-full rounded-2xl border-2 border-hb-ink bg-white px-5 py-4 text-left text-base font-bold transition-colors hover:bg-hb-yellow focus-visible:bg-hb-yellow"
                      >
                        {choice.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </div>
  );
}
