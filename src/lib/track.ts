/**
 * Send a cookie-free analytics event if Plausible is loaded; otherwise do nothing.
 * Allowed events are listed here so nobody sends LV content by accident.
 */
export type TrackEvent =
  | 'lv_opened'
  | 'lv_unsupported'
  | 'lv_fully_priced'
  | 'print_opened'
  | 'checkout_started'
  | 'unlock_ok'
  | 'x84_exported';

type Props = Record<string, string | number | boolean>;

export function track(event: TrackEvent, props?: Props): void {
  const w = globalThis as unknown as { plausible?: (e: string, o?: { props?: Props }) => void };
  try {
    w.plausible?.(event, props ? { props } : undefined);
  } catch {
    /* analytics must never break the tool */
  }
}
