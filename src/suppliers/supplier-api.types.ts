export interface SupplierLookupResult {
  description: string | null;
  stock: number | null;
  unitPrice: number | null;
  currency: string;
  productUrl: string | null;
  datasheetUrl: string | null;
  rawJson: string;
}
