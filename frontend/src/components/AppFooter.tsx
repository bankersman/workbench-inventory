import { useTheme } from '../theme/useTheme';

const GITHUB_URL = 'https://github.com/bankersman/workbench-inventory';

export function AppFooter() {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-stone-200/90 bg-stone-50/90 px-4 py-2.5 text-sm text-zinc-600 backdrop-blur-sm transition-colors dark:border-zinc-800 dark:bg-zinc-950/90 dark:text-zinc-400">
      <button
        type="button"
        onClick={toggleTheme}
        className="min-h-11 min-w-11 rounded-xl border border-stone-300 bg-white px-3 py-1.5 font-medium text-zinc-800 shadow-sm transition hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-400"
      >
        GitHub
      </a>
    </footer>
  );
}
