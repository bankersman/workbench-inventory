import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchJson } from '../api';
import { PageBody, PageHero } from '../components/PageShell';
import type { CategoryAttributeDefinition, CategoryAttributeType } from '../types/category';

interface CategoryRow {
  id: number;
  name: string;
  attributes: CategoryAttributeDefinition[];
}

interface DraftAttribute {
  key: string;
  label: string;
  unit: string;
  type: CategoryAttributeType;
  optionsText: string;
}

function createEmptyDraftAttribute(): DraftAttribute {
  return {
    key: '',
    label: '',
    unit: '',
    type: 'text',
    optionsText: '',
  };
}

function toDraftAttributes(attributes: CategoryAttributeDefinition[]): DraftAttribute[] {
  return attributes.map((a) => ({
    key: a.key,
    label: a.label,
    unit: a.unit ?? '',
    type: a.type,
    optionsText: a.options?.join(', ') ?? '',
  }));
}

function normalizeAttributeKey(value: string): string {
  return value.trim().replace(/\s+/g, '_');
}

function validateAndBuildAttributes(draft: DraftAttribute[]): {
  error: string | null;
  attributes: CategoryAttributeDefinition[];
} {
  const out: CategoryAttributeDefinition[] = [];
  const keys = new Set<string>();
  for (let i = 0; i < draft.length; i += 1) {
    const row = draft[i];
    const key = normalizeAttributeKey(row.key);
    const label = row.label.trim();
    const unit = row.unit.trim();
    const rowLabel = `Attribute ${i + 1}`;
    if (!key) {
      return { error: `${rowLabel}: key is required`, attributes: [] };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
      return {
        error: `${rowLabel}: key may only use letters, numbers, "_" or "-"`,
        attributes: [],
      };
    }
    if (keys.has(key)) {
      return { error: `${rowLabel}: duplicate key "${key}"`, attributes: [] };
    }
    keys.add(key);
    if (!label) {
      return { error: `${rowLabel}: label is required`, attributes: [] };
    }
    const next: CategoryAttributeDefinition = {
      key,
      label,
      unit: unit === '' ? null : unit,
      type: row.type,
    };
    if (row.type === 'enum') {
      const options = row.optionsText
        .split(/[\n,]/)
        .map((v) => v.trim())
        .filter(Boolean);
      if (options.length === 0) {
        return { error: `${rowLabel}: enum options are required`, attributes: [] };
      }
      next.options = options;
    }
    out.push(next);
  }
  return { error: null, attributes: out };
}

function CategoryEditForm({ cid, data }: { cid: number; data: CategoryRow }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [editName, setEditName] = useState(data.name);
  const [draftAttributes, setDraftAttributes] = useState<DraftAttribute[]>(
    toDraftAttributes(data.attributes ?? []),
  );
  const [editErr, setEditErr] = useState<string | null>(null);

  const patchCat = useMutation({
    mutationFn: ({
      id,
      name,
      attributes,
    }: {
      id: number;
      name: string;
      attributes: CategoryAttributeDefinition[];
    }) =>
      fetchJson<CategoryRow>(`/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, attributes }),
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
        const validated = validateAndBuildAttributes(draftAttributes);
        if (validated.error) {
          setEditErr(validated.error);
          return;
        }
        patchCat.mutate({ id: cid, name: trimmed, attributes: validated.attributes });
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
      <div className="mt-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Custom fields</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Keys are stable IDs used in filters and saved item data.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-3 py-2 text-sm dark:border-zinc-600 dark:text-zinc-200"
            onClick={() => {
              setDraftAttributes((prev) => [...prev, createEmptyDraftAttribute()]);
            }}
          >
            Add attribute
          </button>
        </div>
        {draftAttributes.length > 0 ? (
          <div className="mt-3 space-y-3">
            {draftAttributes.map((row, idx) => (
              <fieldset
                key={`attr-${idx}`}
                className="rounded-xl border border-stone-200 p-3 dark:border-zinc-700"
              >
                <legend className="px-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Attribute {idx + 1}
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`attr-key-${idx}`}
                      className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      Key
                    </label>
                    <input
                      id={`attr-key-${idx}`}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                      value={row.key}
                      onChange={(e) =>
                        setDraftAttributes((prev) =>
                          prev.map((p, pIdx) => (pIdx === idx ? { ...p, key: e.target.value } : p)),
                        )
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`attr-label-${idx}`}
                      className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      Label
                    </label>
                    <input
                      id={`attr-label-${idx}`}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                      value={row.label}
                      onChange={(e) =>
                        setDraftAttributes((prev) =>
                          prev.map((p, pIdx) =>
                            pIdx === idx ? { ...p, label: e.target.value } : p,
                          ),
                        )
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`attr-type-${idx}`}
                      className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      Type
                    </label>
                    <select
                      id={`attr-type-${idx}`}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                      value={row.type}
                      onChange={(e) =>
                        setDraftAttributes((prev) =>
                          prev.map((p, pIdx) =>
                            pIdx === idx
                              ? {
                                  ...p,
                                  type: e.target.value as CategoryAttributeType,
                                  optionsText: e.target.value === 'enum' ? p.optionsText : '',
                                }
                              : p,
                          ),
                        )
                      }
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="enum">Enum</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor={`attr-unit-${idx}`}
                      className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      Unit (optional)
                    </label>
                    <input
                      id={`attr-unit-${idx}`}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                      value={row.unit}
                      onChange={(e) =>
                        setDraftAttributes((prev) =>
                          prev.map((p, pIdx) =>
                            pIdx === idx ? { ...p, unit: e.target.value } : p,
                          ),
                        )
                      }
                    />
                  </div>
                  {row.type === 'enum' ? (
                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`attr-options-${idx}`}
                        className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        Enum options (comma or newline separated)
                      </label>
                      <textarea
                        id={`attr-options-${idx}`}
                        rows={2}
                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                        value={row.optionsText}
                        onChange={(e) =>
                          setDraftAttributes((prev) =>
                            prev.map((p, pIdx) =>
                              pIdx === idx ? { ...p, optionsText: e.target.value } : p,
                            ),
                          )
                        }
                      />
                    </div>
                  ) : null}
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center rounded-xl border border-red-300 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:text-red-300"
                    onClick={() =>
                      setDraftAttributes((prev) => prev.filter((_, pIdx) => pIdx !== idx))
                    }
                  >
                    Remove
                  </button>
                </div>
              </fieldset>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">No custom fields yet.</p>
        )}
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
