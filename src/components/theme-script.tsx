// Runs while the browser parses <head>, before first paint, so a saved theme
// never flashes. It reads the nch_theme cookie (THEME_COOKIE in
// src/lib/preferences.ts) and accepts only "light" or "dark". Keeping the
// cookie read here instead of in cookies() lets every page stay prerendered.
// Pattern: node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
const THEME_BOOTSTRAP =
  '(function(){try{var m=document.cookie.match(/(?:^|; )nch_theme=(light|dark)(?:;|$)/);if(m)document.documentElement.setAttribute("data-theme",m[1])}catch(e){}})()';

/** Server component. Render once, inside <head> of the root layout. */
export function ThemeScript() {
  // eslint-disable-next-line react/no-danger -- The only allowed raw-HTML sink in the repo: a constant string with no interpolation, needed to set data-theme before paint.
  return <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />;
}
