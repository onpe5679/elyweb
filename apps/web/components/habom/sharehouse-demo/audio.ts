// 데모 소리: BGM(반복, 교차 페이드) · 음성(한 번에 하나) · 효과음. 사용자가 시작 버튼을 누른 뒤에만 재생한다.
//
// iOS Safari 는 사용자 조작 안에서 한 번 play() 된 <audio> 요소만 나중에 코드로 재생할 수 있다.
// 그래서 unlock() 때 쓸 요소를 미리 만들어 무음으로 한 번 재생해 두고(프라이밍), 이후에는 src 만 바꿔 재사용한다.
import type { Settings } from './storage';

const FADE_MS = 600;

/** 아주 짧은 무음 WAV(data URI) — 프라이밍용 */
function silentWav() {
  const n = 160;
  const buf = new Uint8Array(44 + n);
  const dv = new DataView(buf.buffer);
  const str = (o: number, s: string) => [...s].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF');
  dv.setUint32(4, 36 + n, true);
  str(8, 'WAVEfmt ');
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true);
  dv.setUint16(22, 1, true);
  dv.setUint32(24, 8000, true);
  dv.setUint32(28, 8000, true);
  dv.setUint16(32, 1, true);
  dv.setUint16(34, 8, true);
  str(36, 'data');
  dv.setUint32(40, n, true);
  buf.fill(128, 44);
  let bin = '';
  buf.forEach((b) => (bin += String.fromCharCode(b)));
  return `data:audio/wav;base64,${btoa(bin)}`;
}

export class DemoAudio {
  private bgmPool: HTMLAudioElement[] = [];
  private bgmEl: HTMLAudioElement | null = null;
  private bgmUrl: string | null = null;
  private fading = new Set<HTMLAudioElement>();
  private voiceEl: HTMLAudioElement | null = null;
  private voiceResolve: (() => void) | null = null;
  private sfxPool: HTMLAudioElement[] = [];
  private sfxNext = 0;
  private settings: Settings;
  private unlocked = false;
  private suspended = false;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  /** 사용자 조작 안에서 불러 자동재생 제한을 푼다(요소 프라이밍) */
  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    const silent = silentWav();
    const make = () => {
      const el = new Audio();
      el.preload = 'auto';
      el.src = silent;
      el.muted = true;
      el.play()
        .then(() => {
          el.pause();
          el.muted = false;
        })
        .catch(() => {
          el.muted = false;
        });
      return el;
    };
    this.bgmPool = [make(), make()];
    this.voiceEl = make();
    this.sfxPool = [make(), make(), make()];
  }

  setSettings(s: Settings) {
    this.settings = s;
    if (this.bgmEl && !this.fading.has(this.bgmEl)) this.bgmEl.volume = this.vol('bgm');
    if (this.voiceEl) this.voiceEl.volume = this.vol('voice');
  }

  private vol(kind: 'bgm' | 'voice' | 'sfx') {
    return this.settings.muted ? 0 : this.settings[kind];
  }

  private play(el: HTMLAudioElement, retry = true) {
    el.play().catch((e: DOMException) => {
      // 자동재생 제한에 걸리면 다음 사용자 조작 때 다시 시도
      if (retry && e?.name === 'NotAllowedError') {
        const again = () => {
          if (!this.suspended && (el === this.bgmEl || el === this.voiceEl)) this.play(el, false);
        };
        window.addEventListener('pointerdown', again, { once: true });
        window.addEventListener('keydown', again, { once: true });
      }
    });
  }

  /** BGM 바꾸기(null = 멈춤). 같은 곡이면 그대로 둔다 */
  bgm(url: string | null) {
    if (!this.unlocked) return;
    if (url === this.bgmUrl) {
      if (url && !this.suspended && this.bgmEl?.paused) this.play(this.bgmEl);
      return;
    }
    const old = this.bgmEl;
    if (old) this.fadeOut(old);
    this.bgmUrl = url;
    this.bgmEl = null;
    if (!url) return;
    // 두 요소를 번갈아 쓴다(나가는 곡이 페이드아웃하는 동안 들어오는 곡을 재생)
    const el = this.bgmPool.find((e) => e !== old) ?? new Audio();
    this.fading.delete(el);
    el.loop = true;
    el.src = url;
    el.volume = 0;
    this.bgmEl = el;
    if (!this.suspended) this.fadeIn(el);
  }

  private fadeIn(el: HTMLAudioElement) {
    this.play(el);
    const start = performance.now();
    const tick = () => {
      if (this.bgmEl !== el) return;
      const t = Math.min(1, (performance.now() - start) / FADE_MS);
      el.volume = this.vol('bgm') * t;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  private fadeOut(el: HTMLAudioElement) {
    this.fading.add(el);
    const from = el.volume;
    const start = performance.now();
    const stop = () => {
      el.pause();
      this.fading.delete(el);
    };
    if (this.suspended || from === 0) return stop();
    const tick = () => {
      if (!this.fading.has(el)) return;
      const t = Math.min(1, (performance.now() - start) / FADE_MS);
      el.volume = from * (1 - t);
      if (t < 1) requestAnimationFrame(tick);
      else stop();
    };
    requestAnimationFrame(tick);
    // 탭이 숨겨져 rAF 가 멈춰도 확실히 멈추도록
    window.setTimeout(() => this.fading.has(el) && stop(), FADE_MS + 200);
  }

  /** 화면 밖·탭 숨김일 때 멈추고, 돌아오면 이어서 */
  suspend(on: boolean) {
    if (this.suspended === on) return;
    this.suspended = on;
    if (on) {
      this.bgmEl?.pause();
      this.fading.forEach((el) => el.pause());
      this.fading.clear();
      this.voiceEl?.pause();
    } else if (this.unlocked) {
      if (this.bgmEl) {
        this.bgmEl.volume = this.vol('bgm');
        this.play(this.bgmEl);
      }
      // 재생 중이던 음성이 있으면 이어서
      if (this.voiceResolve && this.voiceEl && this.voiceEl.paused) this.play(this.voiceEl);
    }
  }

  /** 음성 재생. 끝나거나 멈추면 resolve(재생할 수 없으면 바로) */
  voice(url: string | null): Promise<void> {
    this.stopVoice();
    if (!url || !this.unlocked || this.suspended || !this.voiceEl) return Promise.resolve();
    const el = this.voiceEl;
    el.src = url;
    el.volume = this.vol('voice');
    return new Promise((resolve) => {
      const done = () => {
        if (this.voiceResolve === done) this.voiceResolve = null;
        el.onended = null;
        el.onerror = null;
        resolve();
      };
      this.voiceResolve = done;
      el.onended = done;
      el.onerror = done;
      el.play().catch(done);
    });
  }

  stopVoice() {
    const resolve = this.voiceResolve;
    this.voiceResolve = null;
    if (this.voiceEl) {
      this.voiceEl.onended = null;
      this.voiceEl.onerror = null;
      this.voiceEl.pause();
    }
    resolve?.();
  }

  sfx(url: string | null) {
    if (!url || !this.unlocked || this.suspended || this.vol('sfx') === 0) return;
    const el = this.sfxPool.length ? this.sfxPool[this.sfxNext++ % this.sfxPool.length] : new Audio();
    el.src = url;
    el.volume = this.vol('sfx');
    el.play().catch(() => {});
  }

  destroy() {
    [...this.bgmPool, ...this.sfxPool, ...this.fading].forEach((el) => el.pause());
    this.fading.clear();
    this.stopVoice();
    this.bgmEl = null;
  }
}
