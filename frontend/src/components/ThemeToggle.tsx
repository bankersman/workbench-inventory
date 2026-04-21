import { Moon, Sun } from 'lucide-react';

import { useTheme } from '../theme/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
      onClick={toggleTheme}
      className="relative flex h-9 w-[3.25rem] shrink-0 items-center rounded-full border border-stone-300 bg-stone-100 p-0.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:border-zinc-600 dark:bg-zinc-800"
    >
      <span
        className={[
          'absolute left-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-transform dark:bg-zinc-700',
          dark ? 'translate-x-[1.35rem]' : 'translate-x-0',
        ].join(' ')}
      >
        {dark ? (
          <Moon className="h-4 w-4 text-violet-200" aria-hidden />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" aria-hidden />
        )}
      </span>
      <span className="sr-only">{dark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
