import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchJson } from '../api';
import { PageBody, PageHero } from '../components/PageShell';

interface CategoryRow {
  id: number;
  name: string;
}

function CategoryEditForm({ cid, data }: { cid: number; data: CategoryRow }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [editName, setEditName] = useState(data.name);
  const [editErr, setEditErr] = useState<string | null>(null);

  const patchCat = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      fetchJson<CategoryRow>(`/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }),
    onSuccess: async () => {
      setEditErr(null);
      await qc.invalidateQueries({ queryKey: ['categories'] });
      navigate('/settings');
    },
    onError: (e: Error) => setEditErr(e.message),
  });

  return (
    <form
      className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = editName.trim();
        if (!trimmed) {
          setEditErr('Name is required');
          return;
        }
        patchCat.mutate({ id: cid, name: trimmed });
      }}
    >
      <div>
        <label htmlFor="ecat-name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Name
        </label>
        <input
          id="ecat-name"
          className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
        />
      </div>
      {editErr ? <p className="mt-3 text-sm text-red-600">{editErr}</p> : null}
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Link
          to="/settings"
          className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 py-2 text-sm dark:border-zinc-600 dark:text-zinc-200"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={patchCat.isPending}
          className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {patchCat.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export function CategoryEditScreen() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const cid = categoryId ? Number(categoryId) : NaN;

  const catQ = useQuery({
    queryKey: ['category', cid],
    queryFn: () => fetchJson<CategoryRow>(`/categories/${cid}`),
    enabled: Number.isFinite(cid),
  });

  const data = catQ.data;

  if (!Number.isFinite(cid)) {
    return <p className="text-red-600">Invalid category</p>;
  }

  if (catQ.isPending) {
    return (
      <section className="rounded-2xl border p-6">
        <p className="text-zinc-500">Loading…</p>
      </section>
    );
  }

  if (catQ.isError || !data) {
    return (
      <section className="rounded-2xl border border-red-200 p-6">
        <p className="text-red-800">
          {catQ.error instanceof Error ? catQ.error.message : 'Not found'}
        </p>
        <Link to="/settings" className="mt-4 inline-block text-violet-700">
          ← Settings
        </Link>
      </section>
    );
  }

  return (
    <div>
      <PageHero>
        <p className="text-sm font-medium text-violet-700 dark:text-violet-400">
          <Link to="/settings" className="hover:underline">
            ← Settings
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Edit category
        </h1>
      </PageHero>
      <PageBody>
        <CategoryEditForm key={catQ.dataUpdatedAt} cid={cid} data={data} />
      </PageBody>
    </div>
  );
}
