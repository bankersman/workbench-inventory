import { Download, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { apiBase, parseApiErrorMessage } from '../api';
import { PageBody, PageHero, SectionCard } from '../components/PageShell';

type OrderEntry = {
  itemId: number;
  itemName: string;
  quantity: number;
  suggestedQty: number;
  reasons: string[];
  projectGaps: { projectId: number; projectName: string; stillNeeded: number }[];
  preferredSupplier: {
    supplier: string;
    supplierSku: string | null;
    url: string | null;
    unitPrice: number | null;
    currency: string;
    lastFetched: number | null;
  } | null;
};

type OrderListResponse = {
  lowStock: OrderEntry[];
  projectGaps: OrderEntry[];
};

async function fetchOrderList(): Promise<OrderListResponse> {
  const res = await fetch(`${apiBase()}/order-list`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseApiErrorMessage(text, res.status, res.statusText));
  }
  return (await res.json()) as OrderListResponse;
}

function btnOutline(extra = ''): string {
  return [
    'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-stone-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
    extra,
  ].join(' ');
}

function btnPrimary(extra = ''): string {
  return [
    'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-400',
    extra,
  ].join(' ');
}

export function OrderListScreen() {
  const [data, setData] = useState<OrderListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mouserText, setMouserText] = useState('');
  const [tmeText, setTmeText] = useState('');

  const load = async () => {
    setError(null);
    try {
      setData(await fetchOrderList());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const json = await fetchOrderList();
        if (alive) {
          setData(json);
        }
      } catch (e) {
        if (alive) {
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onRefreshPrices = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/order-list/refresh-prices', { method: 'POST' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRefreshing(false);
    }
  };

  const loadShopping = async () => {
    try {
      const [mRes, tRes] = await Promise.all([
        fetch('/api/order-list/export/mouser.txt'),
        fetch('/api/order-list/export/tme.txt'),
      ]);
      setMouserText(await mRes.text());
      setTmeText(await tRes.text());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const pageToolbar = (
    <>
      <button
        type="button"
        className={btnOutline()}
        onClick={() => void load()}
        disabled={refreshing}
      >
        <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />
        Reload data
      </button>
      <button
        type="button"
        className={btnPrimary()}
        onClick={onRefreshPrices}
        disabled={refreshing}
      >
        {refreshing ? 'Refreshing…' : 'Refresh prices'}
      </button>
      <a href="/api/order-list/export.csv" download className={`${btnOutline()} no-underline`}>
        <Download className="h-4 w-4 shrink-0" aria-hidden />
        Export CSV
      </a>
      <button type="button" className={btnOutline()} onClick={() => void loadShopping()}>
        Load shopping lists
      </button>
    </>
  );

  return (
    <div className="screen order-list-screen">
      <PageHero>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Order list
            </h1>
            <p className="mt-2 max-w-xl text-zinc-600 dark:text-zinc-400">
              Low-stock parts and project shortfalls in one place. Use the actions below to refresh
              supplier prices, export for purchasing, or pull Mouser / TME paste lists.
            </p>
          </div>
        </div>
      </PageHero>

      <PageBody>
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </p>
        ) : null}

        <SectionCard title="Actions" toolbar={pageToolbar}>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Reload pulls the latest recommendations from the server. Refresh prices hits supplier
            APIs (may be slow). Shopping lists fill the text areas at the bottom when you are ready
            to paste into distributor import tools.
          </p>
        </SectionCard>

        {mouserText || tmeText ? (
          <SectionCard title="Shopping list text">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Mouser (paste into part list import)
                <textarea
                  readOnly
                  rows={5}
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-mono text-xs text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                  value={mouserText}
                />
              </label>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                TME
                <textarea
                  readOnly
                  rows={5}
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-mono text-xs text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                  value={tmeText}
                />
              </label>
            </div>
          </SectionCard>
        ) : null}

        {!data ? (
          <SectionCard title="Recommendations">
            <p className="text-zinc-500 dark:text-zinc-400">Loading…</p>
          </SectionCard>
        ) : (
          <>
            <SectionCard
              title="Low stock"
              badge={
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950/80 dark:text-amber-100">
                  {data.lowStock.length} lines
                </span>
              }
            >
              {data.lowStock.length === 0 ? (
                <p className="rounded-lg border border-dashed border-stone-200 bg-stone-50/80 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-400">
                  Nothing below reorder threshold right now.
                </p>
              ) : (
                <ul className="divide-y divide-stone-100 dark:divide-zinc-800">
                  {data.lowStock.map((row) => (
                    <li
                      key={row.itemId}
                      className="flex flex-col gap-1 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/items/${row.itemId}`}
                          className="font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-400"
                        >
                          {row.itemName}
                        </Link>
                        <p className="mt-0.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                          Item #{row.itemId}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                        <span>
                          Qty{' '}
                          <strong className="text-zinc-900 dark:text-zinc-100">
                            {row.quantity}
                          </strong>
                          <span aria-hidden> → </span>
                          suggest{' '}
                          <strong className="text-zinc-900 dark:text-zinc-100">
                            {row.suggestedQty}
                          </strong>
                        </span>
                        {row.preferredSupplier?.unitPrice != null ? (
                          <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                            {row.preferredSupplier.unitPrice} {row.preferredSupplier.currency}
                          </span>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              title="Project gaps"
              badge={
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-900 dark:bg-violet-950/80 dark:text-violet-100">
                  {data.projectGaps.length} lines
                </span>
              }
            >
              {data.projectGaps.length === 0 ? (
                <p className="rounded-lg border border-dashed border-stone-200 bg-stone-50/80 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-400">
                  No BOM shortfalls detected for active projects.
                </p>
              ) : (
                <ul className="divide-y divide-stone-100 dark:divide-zinc-800">
                  {data.projectGaps.map((row) => (
                    <li key={row.itemId} className="py-4 first:pt-0">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <Link
                            to={`/items/${row.itemId}`}
                            className="font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-400"
                          >
                            {row.itemName}
                          </Link>
                          <p className="mt-0.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                            Item #{row.itemId}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm text-zinc-600 dark:text-zinc-400">
                          Suggested order:{' '}
                          <strong className="text-zinc-900 dark:text-zinc-100">
                            {row.suggestedQty}
                          </strong>
                        </p>
                      </div>
                      {row.projectGaps.length > 0 ? (
                        <ul className="mt-3 space-y-1 rounded-lg bg-stone-50 px-3 py-2 text-sm dark:bg-zinc-950/60">
                          {row.projectGaps.map((g) => (
                            <li
                              key={g.projectId}
                              className="flex flex-wrap justify-between gap-2 text-zinc-700 dark:text-zinc-300"
                            >
                              <span>{g.projectName}</span>
                              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                need {g.stillNeeded}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </>
        )}
      </PageBody>
    </div>
  );
}
