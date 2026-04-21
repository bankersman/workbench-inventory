import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchJson } from '../api';
import { PageBody, PageHero } from '../components/PageShell';
import type { CategoryAttributeDefinition, CategoryWithAttributes } from '../types/category';

interface ItemDetail {
  id: number;
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
  barcode: string | null;
  containerId: number;
  categoryId: number | null;
  minQty: number | null;
  reorderQty: number | null;
  notes: string | null;
  attributes: Record<string, string | number | null>;
}

interface CategoryRow {
  id: number;
  name: string;
  attributes: CategoryAttributeDefinition[];
}

interface ContainerRow {
  id: number;
  barcode: string;
  name: string;
}

function ItemEditForm({
  itemId,
  data,
  categories,
  containers,
}: {
  itemId: number;
  data: ItemDetail;
  categories: CategoryRow[];
  containers: ContainerRow[];
}) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [editName, setEditName] = useState(data.name);
  const [editDescription, setEditDescription] = useState(data.description ?? '');
  const [editUnit, setEditUnit] = useState(data.unit);
  const [editBarcode, setEditBarcode] = useState(data.barcode ?? '');
  const [editContainerId, setEditContainerId] = useState(String(data.containerId));
  const [editCategoryId, setEditCategoryId] = useState(
    data.categoryId != null ? String(data.categoryId) : '',
  );
  const [editMinQty, setEditMinQty] = useState(data.minQty != null ? String(data.minQty) : '');
  const [editReorderQty, setEditReorderQty] = useState(
    data.reorderQty != null ? String(data.reorderQty) : '',
  );
  const [editNotes, setEditNotes] = useState(data.notes ?? '');
  const [draftAttributes, setDraftAttributes] = useState<Record<string, string>>(
    Object.fromEntries(
      Object.entries(data.attributes ?? {}).map(([key, value]) => [
        key,
        value == null ? '' : String(value),
      ]),
    ),
  );
  const [categoryResetNotice, setCategoryResetNotice] = useState(false);
  const [editErr, setEditErr] = useState<string | null>(null);
  const selectedCategory =
    editCategoryId === ''
      ? null
      : (categories.find((c) => c.id === Number(editCategoryId)) ?? null);

  const patchMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetchJson<ItemDetail>(`/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      setEditErr(null);
      await qc.invalidateQueries({ queryKey: ['item', itemId] });
      await qc.invalidateQueries({ queryKey: ['items'] });
      navigate(`/items/${itemId}`);
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
        if (editContainerId === '') {
          setEditErr('Bin is required');
          return;
        }
        const body: Record<string, unknown> = {
          name: trimmed,
          unit: editUnit.trim() || 'ea',
          description: editDescription.trim() || null,
          barcode: editBarcode.trim() || null,
          notes: editNotes.trim() || null,
          containerId: Number(editContainerId),
          categoryId: editCategoryId === '' ? null : Number(editCategoryId),
        };
        const attributes: Record<string, string | number | null> = {};
        for (const def of selectedCategory?.attributes ?? []) {
          const raw = draftAttributes[def.key] ?? '';
          const trimmedAttr = raw.trim();
          if (trimmedAttr === '') {
            attributes[def.key] = null;
            continue;
          }
          if (def.type === 'number') {
            const parsed = Number(trimmedAttr);
            if (!Number.isFinite(parsed)) {
              setEditErr(`Field "${def.label}" must be a valid number`);
              return;
            }
            attributes[def.key] = parsed;
            continue;
          }
          attributes[def.key] = trimmedAttr;
        }
        body.attributes = attributes;
        const mn = editMinQty.trim();
        const rq = editReorderQty.trim();
        body.minQty = mn === '' ? null : Number(mn);
        body.reorderQty = rq === '' ? null : Number(rq);
        setEditErr(null);
        patchMut.mutate(body);
      }}
    >
      <div>
        <label htmlFor="ie-name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Name
        </label>
        <input
          id="ie-name"
          className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
        />
      </div>
      <div className="mt-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Unit</label>
        <input
          className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          value={editUnit}
          onChange={(e) => setEditUnit(e.target.value)}
        />
      </div>
      <div className="mt-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
        <textarea
          rows={2}
          className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
        />
      </div>
      <div className="mt-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Bin</label>
        <select
          className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          value={editContainerId}
          onChange={(e) => setEditContainerId(e.target.value)}
        >
          {containers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.barcode})
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3">
        <label
          htmlFor="ie-category"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Category
        </label>
        <select
          id="ie-category"
          className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          value={editCategoryId}
          onChange={(e) => {
            setEditCategoryId(e.target.value);
            setDraftAttributes({});
            setCategoryResetNotice(true);
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
        <div className="mt-3 rounded-xl border border-stone-200 p-3 dark:border-zinc-700">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category fields</h2>
          {categoryResetNotice ? (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Category changed: custom field values were reset for the new schema.
            </p>
          ) : null}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {selectedCategory.attributes.map((def) => {
              const label = def.unit ? `${def.label} (${def.unit})` : def.label;
              const value = draftAttributes[def.key] ?? '';
              if (def.type === 'enum') {
                return (
                  <div key={def.key}>
                    <label
                      htmlFor={`ie-attr-${def.key}`}
                      className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      {label}
                    </label>
                    <select
                      id={`ie-attr-${def.key}`}
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
                    htmlFor={`ie-attr-${def.key}`}
                    className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    {label}
                  </label>
                  <input
                    id={`ie-attr-${def.key}`}
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
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Min qty</label>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            value={editMinQty}
            onChange={(e) => setEditMinQty(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Reorder qty
          </label>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            value={editReorderQty}
            onChange={(e) => setEditReorderQty(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Barcode</label>
        <input
          className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          value={editBarcode}
          onChange={(e) => setEditBarcode(e.target.value)}
        />
      </div>
      <div className="mt-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</label>
        <textarea
          rows={2}
          className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
        />
      </div>
      {editErr ? <p className="mt-3 text-sm text-red-600">{editErr}</p> : null}
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Link
          to={`/items/${itemId}`}
          className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 py-2 text-sm dark:border-zinc-600 dark:text-zinc-200"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={patchMut.isPending}
          className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {patchMut.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export function ItemEditScreen() {
  const { id } = useParams<{ id: string }>();
  const itemId = id ? Number(id) : NaN;

  const itemQ = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => fetchJson<ItemDetail>(`/items/${itemId}`),
    enabled: Number.isFinite(itemId),
  });

  const categoriesQ = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchJson<CategoryWithAttributes[]>('/categories'),
  });

  const containersQ = useQuery({
    queryKey: ['containers'],
    queryFn: () => fetchJson<ContainerRow[]>('/containers'),
  });

  const data = itemQ.data;

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

  if (itemQ.isError || !data) {
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

  const categories = categoriesQ.data ?? [];
  const containers = containersQ.data ?? [];

  return (
    <div>
      <PageHero>
        <p className="text-sm font-medium text-violet-700 dark:text-violet-400">
          <Link to={`/items/${itemId}`} className="hover:underline">
            ← {data.name}
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Edit part
        </h1>
      </PageHero>
      <PageBody>
        <ItemEditForm
          key={itemQ.dataUpdatedAt}
          itemId={itemId}
          data={data}
          categories={categories}
          containers={containers}
        />
      </PageBody>
    </div>
  );
}
