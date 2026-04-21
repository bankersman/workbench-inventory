import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

export function CategoryCreateScreen() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [draftAttributes, setDraftAttributes] = useState<DraftAttribute[]>([]);
  const [createErr, setCreateErr] = useState<string | null>(null);

  const createCat = useMutation({
    mutationFn: (body: { name: string; attributes: CategoryAttributeDefinition[] }) =>
      fetchJson<CategoryRow>('/categories', {
        method: 'POST',
        body: JSON.stringify(body),
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
            const validated = validateAndBuildAttributes(draftAttributes);
            if (validated.error) {
              setCreateErr(validated.error);
              return;
            }
            createCat.mutate({
              name: trimmed,
              attributes: validated.attributes,
            });
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
          <div className="mt-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Custom fields
                </h2>
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
                              prev.map((p, pIdx) =>
                                pIdx === idx ? { ...p, key: e.target.value } : p,
                              ),
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
