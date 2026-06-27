export const INTRO_KEY = 'chudo:intro-seen';

export function shouldShowIntro() {
  if (typeof window === 'undefined') return false;
  try { return !localStorage.getItem(INTRO_KEY); }
  catch { return false; }
}

export function markIntroSeen() {
  try { localStorage.setItem(INTRO_KEY, '1'); } catch {}
}

export function resetIntro() {
  try { localStorage.removeItem(INTRO_KEY); } catch {}
}
