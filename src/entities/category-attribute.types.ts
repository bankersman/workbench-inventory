/**
 * Category attribute definition shape (stored as JSON array on Category.attributes).
 * See PLAN.md — Category attribute definition schema.
 */
export type CategoryAttributeType = 'number' | 'text' | 'enum';

export interface CategoryAttributeDefinition {
  key: string;
  label: string;
  unit: string | null;
  type: CategoryAttributeType;
  options?: string[];
}
