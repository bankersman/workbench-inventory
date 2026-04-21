import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ItemCreateScreen } from './ItemCreateScreen';
import { ItemEditScreen } from './ItemEditScreen';

function makeJsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function renderWithProviders(ui: ReactNode, initialEntries: string[] = ['/']) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Item forms dynamic category attributes', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('coerces number/text/enum attribute values on create', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/api/categories')) {
        return makeJsonResponse([
          {
            id: 7,
            name: 'Wire/Cable',
            attributes: [
              { key: 'length', label: 'Length', unit: 'mm', type: 'number' },
              { key: 'color', label: 'Color', unit: null, type: 'text' },
              {
                key: 'kind',
                label: 'Kind',
                unit: null,
                type: 'enum',
                options: ['solid', 'stranded'],
              },
            ],
          },
        ]);
      }
      if (url.endsWith('/api/containers')) {
        return makeJsonResponse([{ id: 3, barcode: 'BIN-3', name: 'Bin 3' }]);
      }
      if (url.endsWith('/api/items') && init?.method === 'POST') {
        return makeJsonResponse({ id: 99 });
      }
      return makeJsonResponse({}, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(
      <Routes>
        <Route path="/" element={<ItemCreateScreen />} />
      </Routes>,
    );

    await screen.findByText('Wire/Cable');
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Hookup Wire' } });
    fireEvent.change(screen.getByLabelText('Bin'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText('Length (mm)'), { target: { value: '12.5' } });
    fireEvent.change(screen.getByLabelText('Color'), { target: { value: 'blue' } });
    fireEvent.change(screen.getByLabelText('Kind'), { target: { value: 'solid' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create part' }));

    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find(
        ([url, init]) =>
          String(url).endsWith('/api/items') && (init as RequestInit).method === 'POST',
      );
      expect(postCall).toBeTruthy();
    });
    const [, postInit] =
      fetchMock.mock.calls.find(
        ([url, init]) =>
          String(url).endsWith('/api/items') && (init as RequestInit).method === 'POST',
      ) ?? [];
    const body = JSON.parse(String((postInit as RequestInit).body)) as {
      attributes: Record<string, string | number | null>;
    };
    expect(body.attributes).toEqual({
      length: 12.5,
      color: 'blue',
      kind: 'solid',
    });
  });

  it('resets dynamic values when category changes in create form', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/api/categories')) {
        return makeJsonResponse([
          {
            id: 1,
            name: 'Cat A',
            attributes: [{ key: 'len', label: 'Length', unit: 'mm', type: 'number' }],
          },
          {
            id: 2,
            name: 'Cat B',
            attributes: [{ key: 'voltage', label: 'Voltage', unit: null, type: 'text' }],
          },
        ]);
      }
      if (url.endsWith('/api/containers')) {
        return makeJsonResponse([{ id: 3, barcode: 'BIN-3', name: 'Bin 3' }]);
      }
      return makeJsonResponse({}, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(
      <Routes>
        <Route path="/" element={<ItemCreateScreen />} />
      </Routes>,
    );

    await screen.findByText('Cat A');
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Length (mm)'), { target: { value: '42' } });

    fireEvent.change(screen.getByLabelText('Category'), { target: { value: '2' } });

    expect(screen.queryByLabelText('Length (mm)')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Voltage')).toHaveValue('');
  });

  it('initializes existing attributes and resets on category change in edit form', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/api/items/5') && (!init || init.method === undefined)) {
        return makeJsonResponse({
          id: 5,
          name: 'Wire Reel',
          description: null,
          quantity: 10,
          unit: 'ea',
          barcode: null,
          containerId: 3,
          categoryId: 1,
          minQty: null,
          reorderQty: null,
          notes: null,
          attributes: { len: 8, kind: 'solid' },
        });
      }
      if (url.endsWith('/api/categories')) {
        return makeJsonResponse([
          {
            id: 1,
            name: 'Cat A',
            attributes: [
              { key: 'len', label: 'Length', unit: 'mm', type: 'number' },
              {
                key: 'kind',
                label: 'Kind',
                unit: null,
                type: 'enum',
                options: ['solid', 'stranded'],
              },
            ],
          },
          {
            id: 2,
            name: 'Cat B',
            attributes: [{ key: 'voltage', label: 'Voltage', unit: null, type: 'text' }],
          },
        ]);
      }
      if (url.endsWith('/api/containers')) {
        return makeJsonResponse([{ id: 3, barcode: 'BIN-3', name: 'Bin 3' }]);
      }
      if (url.endsWith('/api/items/5') && init?.method === 'PATCH') {
        return makeJsonResponse({
          id: 5,
          name: 'Wire Reel',
          description: null,
          quantity: 10,
          unit: 'ea',
          barcode: null,
          containerId: 3,
          categoryId: 2,
          minQty: null,
          reorderQty: null,
          notes: null,
          attributes: { voltage: '24V' },
        });
      }
      return makeJsonResponse({}, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(
      <Routes>
        <Route path="/items/:id/edit" element={<ItemEditScreen />} />
      </Routes>,
      ['/items/5/edit'],
    );

    await screen.findByDisplayValue('Wire Reel');
    expect(screen.getByLabelText('Length (mm)')).toHaveValue(8);

    fireEvent.change(screen.getByLabelText('Category'), { target: { value: '2' } });
    expect(
      screen.getByText('Category changed: custom field values were reset for the new schema.'),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Voltage'), { target: { value: '24V' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      const patchCall = fetchMock.mock.calls.find(
        ([url, init]) =>
          String(url).endsWith('/api/items/5') && (init as RequestInit).method === 'PATCH',
      );
      expect(patchCall).toBeTruthy();
    });
    const [, patchInit] =
      fetchMock.mock.calls.find(
        ([url, init]) =>
          String(url).endsWith('/api/items/5') && (init as RequestInit).method === 'PATCH',
      ) ?? [];
    const body = JSON.parse(String((patchInit as RequestInit).body)) as {
      categoryId: number | null;
      attributes: Record<string, string | number | null>;
    };
    expect(body.categoryId).toBe(2);
    expect(body.attributes).toEqual({ voltage: '24V' });
  });
});
