"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./DialogueExperience.module.css";

const copy = {
  ko: {
    eyebrow: "A LITTLE CHOICE, A NEW STORY",
    title: "이야기의 첫 장을 열어볼까요?",
    description: "대사를 읽고, 마음이 가는 답을 골라보세요.",
    trigger: "짧은 체험 시작하기",
    sample: "인터랙션 시안 · 예시 대사",
    notice: "실제 게임 내용과 무관한 인터랙션 예시입니다.",
    close: "체험 닫기",
    narrator: "내레이션",
    you: "당신의 선택",
    intro: "새로운 이야기는, 작은 선택 하나로 시작되곤 하죠.",
    introDetail: "문 앞에 서서, 잠시 숨을 고릅니다.",
    choice: "낯선 하루의 시작. 어떤 첫인사를 건넬까요?",
    choices: ["밝게 인사를 건넨다.", "조심스럽게 문을 두드린다."],
    replies: [
      "“안녕하세요!”\n목소리에 담긴 작은 용기가, 새로운 하루의 문을 엽니다.",
      "똑, 똑.\n작은 노크 뒤로, 기대가 조용히 피어납니다.",
    ],
    end: "같은 시작, 조금 다른 이야기.",
    endDetail: "당신이 고른 한마디가 다음 장면으로 이어집니다.",
    next: "다음으로",
    previous: "이전 장면",
    restart: "다시 선택하기",
    finish: "작품으로 돌아가기",
    scene: "장면",
    endLabel: "TO BE CONTINUED",
  },
  en: {
    eyebrow: "A LITTLE CHOICE, A NEW STORY",
    title: "Shall we open the first page?",
    description: "Read a little. Follow your heart. Make a choice.",
    trigger: "Try a short experience",
    sample: "Interaction concept · Sample dialogue",
    notice: "A sample interaction, independent of the actual game story.",
    close: "Close experience",
    narrator: "Narrator",
    you: "Your choice",
    intro: "A new story often begins with one small choice.",
    introDetail: "You stand at the door and take a breath.",
    choice: "A new day, a new face. How will you say hello?",
    choices: ["Say a cheerful hello.", "Knock softly on the door."],
    replies: [
      "“Hello!”\nA little courage in your voice opens the door to a new day.",
      "Knock, knock.\nA quiet sense of anticipation follows your gentle knock.",
    ],
    end: "The same beginning. A different little story.",
    endDetail: "One small choice leads to the next scene.",
    next: "Continue",
    previous: "Previous scene",
    restart: "Choose again",
    finish: "Back to the game",
    scene: "Scene",
    endLabel: "TO BE CONTINUED",
  },
  ja: {
    eyebrow: "A LITTLE CHOICE, A NEW STORY",
    title: "物語の最初のページを開いてみませんか。",
    description: "セリフを読んで、心の向く答えを選んでみてください。",
    trigger: "短い体験をはじめる",
    sample: "インタラクション案 · サンプル台詞",
    notice: "実際のゲーム内容とは異なるインタラクションのサンプルです。",
    close: "体験を閉じる",
    narrator: "ナレーション",
    you: "あなたの選択",
    intro: "新しい物語は、小さな選択ひとつから始まるもの。",
    introDetail: "ドアの前に立ち、そっと息を整えます。",
    choice: "見知らぬ一日の始まり。最初の挨拶はどうしますか？",
    choices: ["明るく挨拶する。", "そっとドアをノックする。"],
    replies: [
      "「こんにちは！」\n声に込めた小さな勇気が、新しい一日の扉を開きます。",
      "コン、コン。\n小さなノックのあとに、期待が静かに芽生えます。",
    ],
    end: "同じ始まり、少し違う物語。",
    endDetail: "あなたの選んだ一言が、次の場面へとつながります。",
    next: "次へ",
    previous: "前のシーン",
    restart: "もう一度選ぶ",
    finish: "作品に戻る",
    scene: "シーン",
    endLabel: "TO BE CONTINUED",
  },
};

function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Step = "intro" | "choice" | "answer" | "end";
const sequence: Step[] = ["intro", "choice", "answer", "end"];

export default function DialogueExperience({
  gameTitle,
  image,
  locale,
}: {
  gameTitle: string;
  image: string;
  locale: string;
}) {
  const t = copy[locale as keyof typeof copy] || copy.en;
  const titleId = useId();
  const noticeId = useId();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("intro");
  const [choice, setChoice] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const narrationRef = useRef<HTMLDivElement>(null);
  const currentScene = sequence.indexOf(step) + 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    narrationRef.current?.focus({ preventScroll: true });
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (open) narrationRef.current?.focus({ preventScroll: true });
  }, [step, open]);

  function start() {
    setStep("intro");
    setChoice(0);
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  return (
    <section
      className={styles.invitation}
      aria-labelledby={`${titleId}-invitation`}
    >
      <div className={styles.invitationMark} aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none">
          <path
            d="M15 13h34a8 8 0 0 1 8 8v20a8 8 0 0 1-8 8H30L17 58V49h-2a8 8 0 0 1-8-8V21a8 8 0 0 1 8-8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="22" cy="30" r="2" fill="currentColor" />
          <circle cx="32" cy="30" r="2" fill="currentColor" />
          <circle cx="42" cy="30" r="2" fill="currentColor" />
        </svg>
      </div>
      <div className={styles.invitationCopy}>
        <span>{t.eyebrow}</span>
        <h2 id={`${titleId}-invitation`}>{t.title}</h2>
        <p>{t.description}</p>
        <small>{t.sample}</small>
      </div>
      <button
        ref={triggerRef}
        type="button"
        className={styles.startButton}
        onClick={start}
      >
        {t.trigger}
        <Arrow />
      </button>

      {mounted &&
        createPortal(
          <dialog
            ref={dialogRef}
            className={styles.dialog}
            aria-labelledby={titleId}
            aria-describedby={noticeId}
            onCancel={(event) => {
              event.preventDefault();
              close();
            }}
            onClick={(event) => {
              if (event.target === event.currentTarget) close();
            }}
            onKeyDown={(event) => {
              if (event.key !== "Tab") return;
              const controls = Array.from(
                event.currentTarget.querySelectorAll<HTMLElement>(
                  'button:not([disabled]), a[href], [tabindex="0"]',
                ),
              );
              const first = controls[0];
              const last = controls[controls.length - 1];
              if (
                event.shiftKey &&
                (document.activeElement === first ||
                  document.activeElement === narrationRef.current)
              ) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }}
          >
            <div className={styles.scene}>
              {image && (
                <img className={styles.sceneImage} src={image} alt="" />
              )}
              <div className={styles.sceneShade} />
              <div className={styles.sceneTop}>
                <div>
                  <p>{t.sample}</p>
                  <h2 id={titleId}>{gameTitle}</h2>
                </div>
                <button
                  className={styles.close}
                  type="button"
                  onClick={close}
                  aria-label={t.close}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                    <path
                      d="m6 6 12 12M18 6 6 18"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <div className={styles.sceneBottom}>
                <div className={styles.sceneMeta}>
                  <span>HABOM · A LITTLE STORY</span>
                  <span>
                    {t.scene} {String(currentScene).padStart(2, "0")} / 04
                  </span>
                </div>
                <div className={styles.progress} aria-hidden="true">
                  {sequence.map((item, index) => (
                    <span key={item} data-active={index < currentScene} />
                  ))}
                </div>
                <div className={styles.dialogueBox}>
                  <div
                    className={styles.narration}
                    ref={narrationRef}
                    tabIndex={-1}
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <span className={styles.speaker}>
                      {step === "choice"
                        ? t.you
                        : step === "end"
                          ? t.endLabel
                          : t.narrator}
                    </span>
                    <p>
                      {step === "intro"
                        ? t.intro
                        : step === "choice"
                          ? t.choice
                          : step === "answer"
                            ? t.replies[choice]
                            : t.end}
                    </p>
                    {(step === "intro" || step === "end") && (
                      <small>
                        {step === "intro" ? t.introDetail : t.endDetail}
                      </small>
                    )}
                  </div>
                  {step === "choice" ? (
                    <div className={styles.choices}>
                      {t.choices.map((answer, index) => (
                        <button
                          type="button"
                          key={answer}
                          onClick={() => {
                            setChoice(index);
                            setStep("answer");
                          }}
                        >
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          {answer}
                          <Arrow />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.continueRow}>
                      <button
                        className={styles.continueButton}
                        type="button"
                        onClick={() =>
                          step === "end"
                            ? close()
                            : setStep(step === "intro" ? "choice" : "end")
                        }
                      >
                        {step === "end" ? t.finish : t.next}
                        <Arrow />
                      </button>
                    </div>
                  )}
                  <div className={styles.dialogueFooter}>
                    <button
                      type="button"
                      onClick={() =>
                        setStep(sequence[Math.max(currentScene - 2, 0)])
                      }
                      disabled={step === "intro"}
                    >
                      ← {t.previous}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChoice(0);
                        setStep("choice");
                      }}
                      disabled={step === "intro" || step === "choice"}
                    >
                      {t.restart} ↺
                    </button>
                  </div>
                </div>
                <p id={noticeId} className={styles.notice}>
                  {t.notice}
                </p>
              </div>
            </div>
          </dialog>,
          document.body,
        )}
    </section>
  );
}
