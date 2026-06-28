export const INTRO_KEY = 'chudo:intro-seen';

export function shouldShowIntro() {
  return true;
}

export function markIntroSeen() {}

export function resetIntro() {
  try { localStorage.removeItem(INTRO_KEY); } catch {}
}
