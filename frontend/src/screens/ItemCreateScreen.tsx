import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { fetchJson } from '../api';
import type { CategoryWithAttributes } from '../types/category';

interface ContainerRow {
  id: number;
  barcode: string;
  name: string;
}

export function ItemCreateScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const defaultContainer = searchParams.get('containerId') ?? '';

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('ea');
  const [containerId, setContainerId] = useState(defaultContainer);
  const [categoryId, setCategoryId] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [barcode, setBarcode] = useState('');
  const [draftAttributes, setDraftAttributes] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);

  const categoriesQ = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchJson<CategoryWithAttributes[]>('/categories'),
  });

  const containersQ = useQuery({
    queryKey: ['containers'],
    queryFn: () => fetchJson<ContainerRow[]>('/containers'),
  });

  const categories = categoriesQ.data ?? [];
  const containers = containersQ.data ?? [];
  const selectedCategory =
    categoryId === '' ? null : (categories.find((c) => c.id === Number(categoryId)) ?? null);

  const createMut = useMutation({
    mutationFn: (body: {
      name: string;
      unit: string;
      containerId: number;
      quantity?: number;
      categoryId?: number | null;
      description?: string | null;
      notes?: string | null;
      barcode?: string | null;
      attributes?: Record<string, string | number | null>;
    }) =>
      fetchJson<{ id: number }>('/items', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async (row) => {
      await qc.invalidateQueries({ queryKey: ['items'] });
      navigate(`/items/${row.id}`);
    },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Add part
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Stock lives in a bin—pick where this part sits.
        </p>
      </div>

      <form
        className="rounded-2xl border border-stone-200 bg-white/90 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = name.trim();
          if (!trimmed) {
            setErr('Name is required');
            return;
          }
          if (containerId === '') {
            setErr('Choose a bin');
            return;
          }
          const u = unit.trim() || 'ea';
          const qn = Number(quantity);
          const attributes: Record<string, string | number | null> = {};
          for (const def of selectedCategory?.attributes ?? []) {
            const raw = draftAttributes[def.key] ?? '';
            const trimmed = raw.trim();
            if (trimmed === '') {
              attributes[def.key] = null;
              continue;
            }
            if (def.type === 'number') {
              const parsed = Number(trimmed);
              if (!Number.isFinite(parsed)) {
                setErr(`Field "${def.label}" must be a valid number`);
                return;
              }
              attributes[def.key] = parsed;
              continue;
            }
            attributes[def.key] = trimmed;
          }
          setErr(null);
          createMut.mutate({
            name: trimmed,
            unit: u,
            containerId: Number(containerId),
            quantity: Number.isFinite(qn) ? qn : 0,
            description: description.trim() || null,
            notes: notes.trim() || null,
            barcode: barcode.trim() || null,
            categoryId: categoryId === '' ? null : Number(categoryId),
            attributes,
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="ic-name"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Name
            </label>
            <input
              id="ic-name"
              required
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="ic-unit"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Unit
            </label>
            <input
              id="ic-unit"
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="ea, m, kg…"
            />
          </div>
          <div>
            <label
              htmlFor="ic-qty"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Starting quantity
            </label>
            <input
              id="ic-qty"
              type="number"
              min={0}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="ic-bin"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Bin
            </label>
            <select
              id="ic-bin"
              required
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              value={containerId}
              onChange={(e) => setContainerId(e.target.value)}
            >
              <option value="">— Select bin —</option>
              {containers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.barcode})
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="ic-cat"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Category
            </label>
            <select
              id="ic-cat"
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setDraftAttributes({});
              }}
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {selectedCategory ? (
            <div className="sm:col-span-2 rounded-xl border border-stone-200 p-3 dark:border-zinc-700">
              <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Category fields
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Fields come from the selected category schema.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {selectedCategory.attributes.map((def) => {
                  const label = def.unit ? `${def.label} (${def.unit})` : def.label;
                  const value = draftAttributes[def.key] ?? '';
                  if (def.type === 'enum') {
                    return (
                      <div key={def.key}>
                        <label
                          htmlFor={`ic-attr-${def.key}`}
                          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                        >
                          {label}
                        </label>
                        <select
                          id={`ic-attr-${def.key}`}
                          className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                          value={value}
                          onChange={(e) =>
                            setDraftAttributes((prev) => ({ ...prev, [def.key]: e.target.value }))
                          }
                        >
                          <option value="">— Select —</option>
                          {(def.options ?? []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  return (
                    <div key={def.key}>
                      <label
                        htmlFor={`ic-attr-${def.key}`}
                        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        {label}
                      </label>
                      <input
                        id={`ic-attr-${def.key}`}
                        type={def.type === 'number' ? 'number' : 'text'}
                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                        value={value}
                        onChange={(e) =>
                          setDraftAttributes((prev) => ({ ...prev, [def.key]: e.target.value }))
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <label
              htmlFor="ic-desc"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Description
            </label>
            <textarea
              id="ic-desc"
              rows={2}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ic-bc" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Barcode
            </label>
            <input
              id="ic-bc"
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="ic-notes"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Notes
            </label>
            <textarea
              id="ic-notes"
              rows={2}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        {err ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{err}</p> : null}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={createMut.isPending}
            className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-5 font-medium text-white hover:bg-violet-700 disabled:opacity-60 dark:bg-violet-500"
          >
            {createMut.isPending ? 'Saving…' : 'Create part'}
          </button>
          <Link
            to="/items"
            className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-5 font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
