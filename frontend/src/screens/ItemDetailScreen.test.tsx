import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ItemDetailScreen } from './ItemDetailScreen';

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

describe('ItemDetailScreen specifications', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders category-based specifications with units and empty placeholders', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith('/api/items/11')) {
          return makeJsonResponse({
            id: 11,
            name: 'Wire Reel',
            description: null,
            quantity: 5,
            unit: 'ea',
            barcode: null,
            containerId: 1,
            categoryId: 3,
            minQty: null,
            reorderQty: null,
            notes: null,
            attributes: { length: 25, color: null },
            category: {
              id: 3,
              name: 'Cable',
              attributes: [
                { key: 'length', label: 'Length', unit: 'mm', type: 'number' },
                { key: 'color', label: 'Color', unit: null, type: 'text' },
              ],
            },
            container: { id: 1, barcode: 'BIN-1', name: 'Bin 1' },
          });
        }
        if (url.endsWith('/api/availability/items/11')) {
          return makeJsonResponse({
            quantity: 5,
            inWarehouse: 5,
            totalReserved: 1,
            effectivelyFree: 4,
          });
        }
        return makeJsonResponse({}, 404);
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/items/:id" element={<ItemDetailScreen />} />
      </Routes>,
      ['/items/11'],
    );

    expect(await screen.findByText('Specifications')).toBeInTheDocument();
    expect(screen.getByText('Length:')).toBeInTheDocument();
    expect(screen.getByText('25 mm')).toBeInTheDocument();
    expect(screen.getByText('Color:')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('falls back to key/value specs when category metadata is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith('/api/items/12')) {
          return makeJsonResponse({
            id: 12,
            name: 'Mystery Part',
            description: null,
            quantity: 2,
            unit: 'ea',
            barcode: null,
            containerId: 1,
            categoryId: null,
            minQty: null,
            reorderQty: null,
            notes: null,
            attributes: { customCode: 'A1' },
            category: null,
            container: { id: 1, barcode: 'BIN-1', name: 'Bin 1' },
          });
        }
        if (url.endsWith('/api/availability/items/12')) {
          return makeJsonResponse({
            quantity: 2,
            inWarehouse: 2,
            totalReserved: 0,
            effectivelyFree: 2,
          });
        }
        return makeJsonResponse({}, 404);
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/items/:id" element={<ItemDetailScreen />} />
      </Routes>,
      ['/items/12'],
    );

    expect(await screen.findByText('Specifications')).toBeInTheDocument();
    expect(screen.getByText('customCode:')).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();
  });
});
