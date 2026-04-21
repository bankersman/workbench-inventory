import type { ReactNode } from 'react';

export function PageHero({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        '-mx-4 rounded-b-2xl border-b border-stone-200/90 bg-gradient-to-b from-stone-50 to-stone-50/40 px-4 py-6 dark:border-zinc-800 dark:from-zinc-900/60 dark:to-zinc-950/30 sm:-mx-0 sm:rounded-2xl sm:border sm:px-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

export function PageBody({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={['mt-6 space-y-6', className].filter(Boolean).join(' ')}>{children}</div>;
}

export function SectionCard({
  title,
  badge,
  toolbar,
  children,
  className = '',
}: {
  title?: string;
  badge?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const hasHeader = title != null || badge != null || toolbar != null;
  return (
    <section
      className={[
        'rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {hasHeader ? (
        <div className="mb-4 flex flex-col gap-3 border-b border-stone-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {title ? (
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {title}
              </h2>
            ) : null}
            {badge}
          </div>
          {toolbar ? (
            <div className="flex flex-shrink-0 flex-wrap items-center justify-start gap-2 sm:justify-end">
              {toolbar}
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
