import type { OrderListEntry } from './order-list.service';

function esc(s: string): string {
  return `"${s.replace(/"/g, '""')}"`;
}

export function orderListToCsv(entries: OrderListEntry[]): string {
  const rows = [
    'item_name,quantity,suggested_qty,reasons,preferred_supplier,supplier_sku,unit_price,currency,last_fetched',
  ];
  for (const e of entries) {
    rows.push(
      [
        esc(e.itemName),
        String(e.quantity),
        String(e.suggestedQty),
        esc(e.reasons.join('+')),
        esc(e.preferredSupplier?.supplier ?? ''),
        esc(e.preferredSupplier?.supplierSku ?? ''),
        e.preferredSupplier?.unitPrice != null ? String(e.preferredSupplier.unitPrice) : '',
        e.preferredSupplier?.currency ?? '',
        e.preferredSupplier?.lastFetched != null ? String(e.preferredSupplier.lastFetched) : '',
      ].join(','),
    );
  }
  return rows.join('\n');
}

/** Mouser part-list import: `SKU|qty` per line. */
export function mouserShoppingListText(entries: OrderListEntry[]): string {
  return entries
    .filter((e) => e.mouserSku)
    .map((e) => `${e.mouserSku}|${e.suggestedQty}`)
    .join('\n');
}

/** TME cart import style: `SKU|qty` per line. */
export function tmeShoppingListText(entries: OrderListEntry[]): string {
  return entries
    .filter((e) => e.tmeSku)
    .map((e) => `${e.tmeSku}|${e.suggestedQty}`)
    .join('\n');
}
