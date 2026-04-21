import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CategoryCreateScreen } from './CategoryCreateScreen';
import { CategoryEditScreen } from './CategoryEditScreen';

function makeJsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function renderWithProviders(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('Category attribute screens', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('allows adding and removing attribute rows in create screen', () => {
    vi.stubGlobal('fetch', vi.fn());
    renderWithProviders(
      <MemoryRouter>
        <CategoryCreateScreen />
      </MemoryRouter>,
    );

    expect(screen.getByText('No custom fields yet.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add attribute' }));
    expect(screen.getByLabelText('Key')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.getByText('No custom fields yet.')).toBeInTheDocument();
  });

  it('validates duplicate keys before posting category', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <MemoryRouter>
        <CategoryCreateScreen />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Connectors' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add attribute' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add attribute' }));

    const keyInputs = screen.getAllByLabelText('Key');
    const labelInputs = screen.getAllByLabelText('Label');
    fireEvent.change(keyInputs[0], { target: { value: 'pitch' } });
    fireEvent.change(labelInputs[0], { target: { value: 'Pitch' } });
    fireEvent.change(keyInputs[1], { target: { value: 'pitch' } });
    fireEvent.change(labelInputs[1], { target: { value: 'Pitch duplicate' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Attribute 2: duplicate key "pitch"')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts enum options payload from create screen', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(makeJsonResponse({ id: 10, name: 'Wire', attributes: [] }));
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(
      <MemoryRouter>
        <CategoryCreateScreen />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Wire/Cable' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add attribute' }));
    fireEvent.change(screen.getByLabelText('Key'), { target: { value: 'type' } });
    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Type' } });
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'enum' } });
    fireEvent.change(screen.getByLabelText('Enum options (comma or newline separated)'), {
      target: { value: 'solid, stranded\ncoax' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as {
      name: string;
      attributes: Array<{ key: string; type: string; options?: string[] }>;
    };
    expect(body.name).toBe('Wire/Cable');
    expect(body.attributes).toEqual([
      {
        key: 'type',
        label: 'Type',
        unit: null,
        type: 'enum',
        options: ['solid', 'stranded', 'coax'],
      },
    ]);
  });

  it('loads category attributes and sends patch payload on edit', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        makeJsonResponse({
          id: 2,
          name: 'Fasteners',
          attributes: [{ key: 'diameter', label: 'Diameter', unit: 'mm', type: 'number' }],
        }),
      )
      .mockResolvedValueOnce(
        makeJsonResponse({
          id: 2,
          name: 'Fasteners v2',
          attributes: [
            { key: 'diameter', label: 'Diameter', unit: 'mm', type: 'number' },
            { key: 'material', label: 'Material', unit: null, type: 'text' },
          ],
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(
      <MemoryRouter initialEntries={['/settings/categories/2/edit']}>
        <Routes>
          <Route path="/settings/categories/:categoryId/edit" element={<CategoryEditScreen />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByDisplayValue('Fasteners');
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Fasteners v2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add attribute' }));

    const keyInputs = screen.getAllByLabelText('Key');
    const labelInputs = screen.getAllByLabelText('Label');
    const unitInputs = screen.getAllByLabelText('Unit (optional)');
    const typeInputs = screen.getAllByLabelText('Type');
    fireEvent.change(keyInputs[1], { target: { value: 'material' } });
    fireEvent.change(labelInputs[1], { target: { value: 'Material' } });
    fireEvent.change(unitInputs[1], { target: { value: '' } });
    fireEvent.change(typeInputs[1], { target: { value: 'text' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const [, patchInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    const body = JSON.parse(String(patchInit.body)) as {
      name: string;
      attributes: Array<{ key: string; label: string; unit: string | null; type: string }>;
    };
    expect(body).toEqual({
      name: 'Fasteners v2',
      attributes: [
        { key: 'diameter', label: 'Diameter', unit: 'mm', type: 'number' },
        { key: 'material', label: 'Material', unit: null, type: 'text' },
      ],
    });
  });
});
