import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type OrderEntry = {
  itemId: number;
  itemName: string;
  quantity: number;
  suggestedQty: number;
  reasons: string[];
  projectGaps: { projectId: number; projectName: string; stillNeeded: number }[];
  preferredSupplier: {
    supplier: string;
    supplierSku: string | null;
    url: string | null;
    unitPrice: number | null;
    currency: string;
    lastFetched: number | null;
  } | null;
};

type OrderListResponse = {
  lowStock: OrderEntry[];
  projectGaps: OrderEntry[];
};

async function fetchOrderList(): Promise<OrderListResponse> {
  const res = await fetch('/api/order-list');
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return (await res.json()) as OrderListResponse;
}

export function OrderListScreen() {
  const [data, setData] = useState<OrderListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mouserText, setMouserText] = useState('');
  const [tmeText, setTmeText] = useState('');

  const load = async () => {
    setError(null);
    try {
      setData(await fetchOrderList());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const json = await fetchOrderList();
        if (alive) {
          setData(json);
        }
      } catch (e) {
        if (alive) {
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onRefreshPrices = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/order-list/refresh-prices', { method: 'POST' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRefreshing(false);
    }
  };

  const loadShopping = async () => {
    try {
      const [mRes, tRes] = await Promise.all([
        fetch('/api/order-list/export/mouser.txt'),
        fetch('/api/order-list/export/tme.txt'),
      ]);
      setMouserText(await mRes.text());
      setTmeText(await tRes.text());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="screen order-list-screen">
      <h1>Order list</h1>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="order-actions">
        <button type="button" onClick={() => void load()} disabled={refreshing}>
          Reload
        </button>
        <button type="button" onClick={onRefreshPrices} disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh prices'}
        </button>
        <a href="/api/order-list/export.csv" download>
          Export CSV
        </a>
        <button type="button" onClick={() => void loadShopping()}>
          Load shopping lists
        </button>
      </div>
      {mouserText || tmeText ? (
        <div className="shopping-lists">
          <label>
            Mouser (paste into part list import)
            <textarea readOnly rows={4} value={mouserText} />
          </label>
          <label>
            TME
            <textarea readOnly rows={4} value={tmeText} />
          </label>
        </div>
      ) : null}
      {data ? (
        <>
          <section>
            <h2>Low stock</h2>
            <ul className="order-section">
              {data.lowStock.length === 0 ? (
                <li className="muted">None</li>
              ) : (
                data.lowStock.map((row) => (
                  <li key={row.itemId}>
                    <Link to={`/items/${row.itemId}`}>{row.itemName}</Link>
                    <span className="muted">
                      {' '}
                      qty {row.quantity} → suggest {row.suggestedQty}
                    </span>
                    {row.preferredSupplier?.unitPrice != null ? (
                      <span className="muted">
                        {' '}
                        {row.preferredSupplier.unitPrice} {row.preferredSupplier.currency}
                      </span>
                    ) : null}
                  </li>
                ))
              )}
            </ul>
          </section>
          <section>
            <h2>Project gaps</h2>
            <ul className="order-section">
              {data.projectGaps.length === 0 ? (
                <li className="muted">None</li>
              ) : (
                data.projectGaps.map((row) => (
                  <li key={row.itemId}>
                    <Link to={`/items/${row.itemId}`}>{row.itemName}</Link>
                    <span className="muted"> suggest {row.suggestedQty}</span>
                    {row.projectGaps.length > 0 ? (
                      <ul>
                        {row.projectGaps.map((g) => (
                          <li key={g.projectId}>
                            {g.projectName}: need {g.stillNeeded}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))
              )}
            </ul>
          </section>
        </>
      ) : (
        <p className="muted">Loading…</p>
      )}
    </div>
  );
}
