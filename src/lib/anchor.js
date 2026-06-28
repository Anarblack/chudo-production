let _anchorScrollActive = false;
let _anchorScrollTimer = null;

export function startAnchorScroll() {
  _anchorScrollActive = true;
  clearTimeout(_anchorScrollTimer);
  _anchorScrollTimer = setTimeout(() => { _anchorScrollActive = false; }, 1300);
}

export function isAnchorScrollActive() {
  return _anchorScrollActive;
}
