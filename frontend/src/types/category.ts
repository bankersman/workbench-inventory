export type CategoryAttributeType = 'number' | 'text' | 'enum';

export interface CategoryAttributeDefinition {
  key: string;
  label: string;
  unit: string | null;
  type: CategoryAttributeType;
  options?: string[];
}

export interface CategoryWithAttributes {
  id: number;
  name: string;
  attributes: CategoryAttributeDefinition[];
}
