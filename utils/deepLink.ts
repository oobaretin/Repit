/** Parse repit://practice?start=1 from widget or external links. */
export function parsePracticeDeepLink(url: string): { autoStart: boolean } | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'repit:') return null;
    if (parsed.host !== 'practice') return null;
    return { autoStart: parsed.searchParams.get('start') === '1' };
  } catch {
    return null;
  }
}

export const PRACTICE_WIDGET_URL = 'repit://practice?start=1';
