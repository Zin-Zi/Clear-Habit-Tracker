/**
 * ONE shared 1-second clock for the whole app.
 *
 * Every per-second label (elapsed rings, timers) subscribes instead of owning
 * its own setInterval, so N cards cost a single timer callback instead of N.
 * The interval only runs while at least one subscriber exists and the app is
 * visible: it pauses on tab hide / Capacitor background and resumes on return.
 */

type TickListener = (nowMs: number) => void;

const listeners = new Set<TickListener>();
let timer: ReturnType<typeof setInterval> | null = null;

function start() {
  if (timer || typeof window === 'undefined') return;
  timer = setInterval(() => {
    const now = Date.now();
    listeners.forEach((fn) => {
      try {
        fn(now);
      } catch {
        // A dead subscriber must never kill the shared clock.
      }
    });
  }, 1000);
}

function stop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function syncRunning() {
  if (typeof document !== 'undefined' && document.hidden) {
    stop();
    return;
  }
  if (listeners.size === 0) {
    stop();
    return;
  }
  start();
}

/** Subscribe to the shared 1s tick. Returns an unsubscribe function. */
export function subscribeTick(fn: TickListener): () => void {
  listeners.add(fn);
  syncRunning();
  return () => {
    listeners.delete(fn);
    syncRunning();
  };
}

/** For tests/probes: how many live subscribers exist right now. */
export function tickSubscriberCount(): number {
  return listeners.size;
}

/** Pause the clock (app backgrounded). It resumes on next subscribe or tick. */
export function pauseTicker(): void {
  stop();
}

/** Resume the clock if subscribers exist (app foregrounded). */
export function resumeTicker(): void {
  syncRunning();
}

/**
 * Wire tab-visibility pause/resume once at app startup. Safe to call in any
 * environment. (Capacitor foreground/background is driven by the caller via
 * pauseTicker/resumeTicker so this module never imports native plugins.)
 */
export function initTickerLifecycle(): void {
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', syncRunning);
  }
}
