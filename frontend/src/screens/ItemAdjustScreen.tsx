import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchJson } from '../api';
import { PageBody, PageHero } from '../components/PageShell';

interface ItemDetail {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

export function ItemAdjustScreen() {
  const { id } = useParams<{ id: string }>();
  const itemId = id ? Number(id) : NaN;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [delta, setDelta] = useState('0');
  const [reason, setReason] = useState('');
  const [adjustErr, setAdjustErr] = useState<string | null>(null);

  const itemQ = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => fetchJson<ItemDetail>(`/items/${itemId}`),
    enabled: Number.isFinite(itemId),
  });

  const adjustMut = useMutation({
    mutationFn: (body: { delta: number; reason: string }) =>
      fetchJson<{ previousQuantity: number; newQuantity: number; delta: number; reason: string }>(
        `/items/${itemId}/adjust-quantity`,
        { method: 'POST', body: JSON.stringify(body) },
      ),
    onSuccess: async () => {
      setAdjustErr(null);
      await qc.invalidateQueries({ queryKey: ['item', itemId] });
      await qc.invalidateQueries({ queryKey: ['availability', itemId] });
      await qc.invalidateQueries({ queryKey: ['items'] });
      navigate(`/items/${itemId}`);
    },
    onError: (e: Error) => setAdjustErr(e.message),
  });

  if (!Number.isFinite(itemId)) {
    return <p className="text-red-600">Invalid part</p>;
  }

  if (itemQ.isPending) {
    return (
      <section className="rounded-2xl border p-6">
        <p className="text-zinc-500">Loading…</p>
      </section>
    );
  }

  if (itemQ.isError || !itemQ.data) {
    return (
      <section className="rounded-2xl border border-red-200 p-6">
        <p className="text-red-800">
          {itemQ.error instanceof Error ? itemQ.error.message : 'Not found'}
        </p>
        <Link to="/items" className="mt-4 inline-block text-violet-700">
          ← Parts
        </Link>
      </section>
    );
  }

  const item = itemQ.data;

  return (
    <div>
      <PageHero>
        <p className="text-sm font-medium text-violet-700 dark:text-violet-400">
          <Link to={`/items/${itemId}`} className="hover:underline">
            ← {item.name}
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Adjust quantity
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Current on hand: <strong>{item.quantity}</strong> {item.unit}. Enter a positive or
          negative change (e.g. −2 after a count).
        </p>
      </PageHero>
      <PageBody>
        <form
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80"
          onSubmit={(e) => {
            e.preventDefault();
            const r = reason.trim();
            if (!r) {
              setAdjustErr('Reason is required');
              return;
            }
            const d = Number(delta);
            if (!Number.isFinite(d) || !Number.isInteger(d)) {
              setAdjustErr('Enter a whole number change');
              return;
            }
            const next = item.quantity + d;
            if (next < 0) {
              setAdjustErr('Result cannot be negative');
              return;
            }
            setAdjustErr(null);
            adjustMut.mutate({ delta: d, reason: r });
          }}
        >
          <div>
            <label htmlFor="adj-d" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Change (delta)
            </label>
            <input
              id="adj-d"
              type="number"
              step={1}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
            />
            <p className="mt-1 text-xs text-zinc-500">
              New total will be{' '}
              <strong>
                {item.quantity + (Number.isFinite(Number(delta)) ? Number(delta) : 0)}
              </strong>{' '}
              {item.unit}
            </p>
          </div>
          <div className="mt-4">
            <label htmlFor="adj-r" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Reason
            </label>
            <input
              id="adj-r"
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Physical count, pull for build, …"
            />
          </div>
          {adjustErr ? <p className="mt-3 text-sm text-red-600">{adjustErr}</p> : null}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Link
              to={`/items/${itemId}`}
              className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 py-2 text-sm dark:border-zinc-600 dark:text-zinc-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={adjustMut.isPending}
              className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {adjustMut.isPending ? 'Saving…' : 'Apply'}
            </button>
          </div>
        </form>
      </PageBody>
    </div>
  );
}
