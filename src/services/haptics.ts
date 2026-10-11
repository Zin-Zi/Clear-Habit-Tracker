import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Every haptic call in the app routes through here so the Settings toggle is a
 * single switch. The flag is held in a module-level variable (updated by
 * App.tsx whenever settings change) rather than imported per-component, so a
 * tap handler never has to thread settings through props or re-subscribe.
 */
let enabled = true;

export const setHapticsEnabled = (value: boolean) => {
  enabled = value;
};

const safe = async (fn: () => Promise<unknown>) => {
  if (!enabled) return;
  try {
    await fn();
  } catch {
    // Plugin unavailable (e.g. web browser) — ignore.
  }
};

/** Light tap — nav items, calendar cells, small buttons. */
export const tapLight = () => safe(() => Haptics.impact({ style: ImpactStyle.Light }));

/** Medium tap — primary actions such as the FAB. */
export const tapMedium = () => safe(() => Haptics.impact({ style: ImpactStyle.Medium }));

/** Heavy tap — destructive / long-press actions. */
export const tapHeavy = () => safe(() => Haptics.impact({ style: ImpactStyle.Heavy }));

/** Success / confirmation buzz. */
export const notifySuccess = () =>
  safe(() => Haptics.notification({ type: NotificationType.Success }));