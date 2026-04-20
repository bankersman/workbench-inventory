import type { OrderListEntry } from './order-list.service';
import {
  mouserShoppingListText,
  orderListToCsv,
  tmeShoppingListText,
} from './order-list-export.util';

function entry(
  partial: Partial<OrderListEntry> & Pick<OrderListEntry, 'itemId' | 'itemName'>,
): OrderListEntry {
  return {
    quantity: 0,
    minQty: null,
    reorderQty: null,
    reasons: ['low_stock'],
    projectGaps: [],
    suggestedQty: 5,
    preferredSupplier: null,
    mouserSku: null,
    tmeSku: null,
    ...partial,
  };
}

describe('order-list-export.util', () => {
  it('orderListToCsv includes header and row', () => {
    const csv = orderListToCsv([
      entry({
        itemId: 1,
        itemName: 'R1',
        reasons: ['low_stock', 'project_gap'],
        preferredSupplier: {
          supplier: 'Mouser',
          supplierSku: '512-X',
          url: 'https://example.com',
          unitPrice: 1.2,
          currency: 'USD',
          lastFetched: 100,
        },
      }),
    ]);
    expect(csv).toContain('item_name');
    expect(csv).toContain('R1');
    expect(csv).toContain('low_stock+project_gap');
  });

  it('mouserShoppingListText is pipe-delimited', () => {
    const t = mouserShoppingListText([
      entry({ itemId: 1, itemName: 'A', mouserSku: '512-X', suggestedQty: 3 }),
    ]);
    expect(t).toBe('512-X|3');
  });

  it('tmeShoppingListText is pipe-delimited', () => {
    const t = tmeShoppingListText([
      entry({ itemId: 1, itemName: 'A', tmeSku: 'T123', suggestedQty: 2 }),
    ]);
    expect(t).toBe('T123|2');
  });
});
