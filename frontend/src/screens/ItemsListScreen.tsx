import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { fetchJson } from '../api';
import { PageBody, PageHero, SectionCard } from '../components/PageShell';

interface ItemRow {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  barcode: string | null;
  containerId: number;
  categoryId: number | null;
}

interface CategoryRow {
  id: number;
  name: string;
}

interface ContainerRow {
  id: number;
  barcode: string;
  name: string;
}

interface SuRow {
  id: number;
  name: string;
}

function parseFilters(sp: URLSearchParams) {
  return {
    q: sp.get('q') ?? '',
    categoryId: sp.get('categoryId') ?? '',
    containerId: sp.get('containerId') ?? '',
    storageUnitId: sp.get('storageUnitId') ?? '',
  };
}

function ItemsListInner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => parseFilters(searchParams));

  const apiPath = (() => {
    const p = new URLSearchParams();
    const qt = filters.q.trim();
    if (qt) {
      p.set('q', qt);
    }
    if (filters.categoryId !== '') {
      p.set('categoryId', filters.categoryId);
    }
    if (filters.containerId !== '') {
      p.set('containerId', filters.containerId);
    }
    if (filters.storageUnitId !== '') {
      p.set('storageUnitId', filters.storageUnitId);
    }
    const qs = p.toString();
    return qs ? `/items?${qs}` : '/items';
  })();

  const itemsQ = useQuery({
    queryKey: ['items', apiPath],
    queryFn: () => fetchJson<ItemRow[]>(apiPath),
  });

  const categoriesQ = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchJson<CategoryRow[]>('/categories'),
  });

  const containersQ = useQuery({
    queryKey: ['containers'],
    queryFn: () => fetchJson<ContainerRow[]>('/containers'),
  });

  const unitsQ = useQuery({
    queryKey: ['storage-units'],
    queryFn: () => fetchJson<SuRow[]>('/storage-units'),
  });

  const categories = categoriesQ.data ?? [];
  const containers = containersQ.data ?? [];
  const units = unitsQ.data ?? [];

  const apply = () => {
    const p = new URLSearchParams();
    const qt = filters.q.trim();
    if (qt) {
      p.set('q', qt);
    }
    if (filters.categoryId !== '') {
      p.set('categoryId', filters.categoryId);
    }
    if (filters.containerId !== '') {
      p.set('containerId', filters.containerId);
    }
    if (filters.storageUnitId !== '') {
      p.set('storageUnitId', filters.storageUnitId);
    }
    setSearchParams(p);
  };

  const clear = () => {
    setFilters({ q: '', categoryId: '', containerId: '', storageUnitId: '' });
    setSearchParams({});
  };

  return (
    <div>
      <PageHero>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Parts
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Search by name and narrow by location or category.
            </p>
          </div>
          <Link
            to="/items/new"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 px-5 font-medium text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400"
          >
            Add part
          </Link>
        </div>
      </PageHero>

      <PageBody>
        <SectionCard title="Filters">
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="flt-q"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Search
              </label>
              <input
                id="flt-q"
                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                placeholder="Name or description contains…"
              />
            </div>
            <div>
              <label
                htmlFor="flt-cat"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Category
              </label>
              <select
                id="flt-cat"
                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                value={filters.categoryId}
                onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="">Any</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="flt-su"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Storage unit
              </label>
              <select
                id="flt-su"
                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                value={filters.storageUnitId}
                onChange={(e) => setFilters((f) => ({ ...f, storageUnitId: e.target.value }))}
              >
                <option value="">Any</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="flt-bin"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Bin (container)
              </label>
              <select
                id="flt-bin"
                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                value={filters.containerId}
                onChange={(e) => setFilters((f) => ({ ...f, containerId: e.target.value }))}
              >
                <option value="">Any</option>
                {containers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.barcode})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={apply}
              className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 font-medium text-white hover:bg-violet-700 dark:bg-violet-500"
            >
              Apply filters
            </button>
            <button
              type="button"
              onClick={clear}
              className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
            >
              Clear
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Results">
          {itemsQ.isPending ? (
            <p className="text-zinc-500">Loading…</p>
          ) : itemsQ.isError ? (
            <p className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {itemsQ.error instanceof Error ? itemsQ.error.message : 'Failed to load'}
            </p>
          ) : (itemsQ.data ?? []).length === 0 ? (
            <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
              No matching parts. Try a shorter search or clear filters.
            </p>
          ) : (
            <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 dark:divide-zinc-700 dark:border-zinc-700">
              {(itemsQ.data ?? []).map((row) => (
                <li
                  key={row.id}
                  className="flex min-h-14 flex-col gap-2 px-4 py-3 transition hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-zinc-800/80"
                >
                  <Link to={`/items/${row.id}`} className="min-w-0 flex-1">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{row.name}</span>
                    {row.barcode ? (
                      <span className="ml-2 font-mono text-sm text-zinc-500 dark:text-zinc-400">
                        {row.barcode}
                      </span>
                    ) : null}
                  </Link>
                  <div className="flex shrink-0 flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <span>
                      {row.quantity} {row.unit}
                    </span>
                    <Link
                      to={`/containers/${row.containerId}`}
                      className="font-medium text-violet-700 hover:underline dark:text-violet-400"
                    >
                      Bin #{row.containerId}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <Link
          to="/"
          className="inline-flex min-h-11 items-center font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-400"
        >
          ← Home
        </Link>
      </PageBody>
    </div>
  );
}

export function ItemsListScreen() {
  const [searchParams] = useSearchParams();
  return <ItemsListInner key={searchParams.toString()} />;
}
