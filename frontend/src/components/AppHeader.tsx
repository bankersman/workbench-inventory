import { NavLink } from 'react-router-dom';

import { GitHubMark } from './GitHubMark';
import { ThemeToggle } from './ThemeToggle';

const GITHUB_URL = 'https://github.com/bankersman/workbench-inventory';

function navClass({ isActive }: { isActive: boolean }): string {
  return [
    'inline-flex min-h-11 shrink-0 items-center rounded-lg px-2.5 text-sm font-medium transition-colors',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500',
    isActive
      ? 'bg-violet-100 text-violet-900 dark:bg-violet-950/80 dark:text-violet-100'
      : 'text-zinc-600 hover:bg-stone-200/80 dark:text-zinc-400 dark:hover:bg-zinc-800/80',
  ].join(' ');
}

export function AppHeader() {
  return (
    <header className="border-t border-stone-200/80 dark:border-zinc-800/80">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-2 px-1 py-2 sm:gap-3">
        <NavLink
          to="/"
          className="min-h-11 shrink-0 rounded-lg px-1 text-left text-base font-semibold tracking-tight text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:text-zinc-50"
          end
        >
          Workbench Inventory
        </NavLink>
        <nav
          className="order-3 flex w-full flex-wrap items-center justify-start gap-1 sm:order-none sm:flex-1 sm:justify-center sm:px-2"
          aria-label="Main"
        >
          <NavLink className={navClass} to="/" end>
            Home
          </NavLink>
          <NavLink className={navClass} to="/inventory">
            Inventory
          </NavLink>
          <NavLink className={navClass} to="/items">
            Parts
          </NavLink>
          <NavLink className={navClass} to="/projects">
            Projects
          </NavLink>
          <NavLink className={navClass} to="/order">
            Order
          </NavLink>
          <NavLink className={navClass} to="/settings">
            Settings
          </NavLink>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-stone-300 bg-white text-zinc-800 shadow-sm transition hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Source on GitHub"
            title="GitHub"
          >
            <GitHubMark className="h-5 w-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
