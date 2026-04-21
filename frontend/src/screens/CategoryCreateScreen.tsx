import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { fetchJson } from '../api';
import { PageBody, PageHero } from '../components/PageShell';

interface CategoryRow {
  id: number;
  name: string;
}

export function CategoryCreateScreen() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [createErr, setCreateErr] = useState<string | null>(null);

  const createCat = useMutation({
    mutationFn: (n: string) =>
      fetchJson<CategoryRow>('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: n }),
      }),
    onSuccess: async () => {
      setCreateErr(null);
      await qc.invalidateQueries({ queryKey: ['categories'] });
      navigate('/settings');
    },
    onError: (e: Error) => setCreateErr(e.message),
  });

  return (
    <div>
      <PageHero>
        <p className="text-sm font-medium text-violet-700 dark:text-violet-400">
          <Link to="/settings" className="hover:underline">
            ← Settings
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          New category
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Group parts for search and filters. Names should be short and clear.
        </p>
      </PageHero>
      <PageBody>
        <form
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = name.trim();
            if (!trimmed) {
              setCreateErr('Name is required');
              return;
            }
            createCat.mutate(trimmed);
          }}
        >
          <div>
            <label
              htmlFor="cat-name"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Name
            </label>
            <input
              id="cat-name"
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          {createErr ? <p className="mt-3 text-sm text-red-600">{createErr}</p> : null}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Link
              to="/settings"
              className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 py-2 text-sm dark:border-zinc-600 dark:text-zinc-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createCat.isPending}
              className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {createCat.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </PageBody>
    </div>
  );
}
