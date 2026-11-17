import { useEffect, useState } from 'react';

const localTheme = () => new Date().getHours() >= 6 && new Date().getHours() < 20 ? 'day' : 'night';

export function useTheme() {
  const [automaticTheme, setAutomaticTheme] = useState(localTheme);
  const [override, setOverride] = useState(null);
  const theme = override || automaticTheme;
  useEffect(() => {
    const update = () => setAutomaticTheme(localTheme());
    const interval = setInterval(update, 15000);
    document.addEventListener('visibilitychange', update);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', update); };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'night' ? '#031740' : '#f2e8d8');
  }, [theme]);
  return { theme, isAutomatic: override === null, toggle: () => setOverride(theme === 'day' ? 'night' : 'day'), reset: () => setOverride(null) };
}
