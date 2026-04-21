import { Link } from 'react-router-dom';

import { PageBody, PageHero, SectionCard } from '../components/PageShell';

export function HomeScreen() {
  return (
    <div>
      <PageHero>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Home
        </h1>
        <p className="mt-2 max-w-lg text-zinc-600 dark:text-zinc-400">
          Scan a barcode or use search from detail routes. Use the top navigation to jump anywhere
          in the app.
        </p>
      </PageHero>
      <PageBody>
        <SectionCard title="Quick navigation">
          <nav className="flex flex-wrap gap-3" aria-label="Quick navigation">
            <Link
              className="inline-flex min-h-12 items-center rounded-xl border border-stone-300 bg-white px-5 font-medium text-zinc-900 shadow-sm transition hover:bg-stone-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              to="/inventory"
            >
              Inventory
            </Link>
            <Link
              className="inline-flex min-h-12 items-center rounded-xl border border-stone-300 bg-white px-5 font-medium text-zinc-900 shadow-sm transition hover:bg-stone-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              to="/projects"
            >
              Projects
            </Link>
            <Link
              className="inline-flex min-h-12 items-center rounded-xl border border-stone-300 bg-white px-5 font-medium text-zinc-900 shadow-sm transition hover:bg-stone-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              to="/items"
            >
              Parts
            </Link>
            <Link
              className="inline-flex min-h-12 items-center rounded-xl border border-stone-300 bg-white px-5 font-medium text-zinc-900 shadow-sm transition hover:bg-stone-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              to="/order"
            >
              Order
            </Link>
          </nav>
        </SectionCard>
      </PageBody>
    </div>
  );
}
