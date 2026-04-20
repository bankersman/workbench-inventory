import { BadRequestException } from '@nestjs/common';

import type {
  CategoryAttributeDefinition,
  CategoryAttributeType,
} from '../entities/category-attribute.types';

const TYPES: CategoryAttributeType[] = ['number', 'text', 'enum'];

export function assertValidCategoryAttributes(value: unknown): CategoryAttributeDefinition[] {
  if (!Array.isArray(value)) {
    throw new BadRequestException('attributes must be a JSON array');
  }
  const out: CategoryAttributeDefinition[] = [];
  for (const raw of value) {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new BadRequestException('each attribute definition must be an object');
    }
    const o = raw as Record<string, unknown>;
    if (typeof o.key !== 'string' || o.key.length === 0) {
      throw new BadRequestException('each attribute must have a non-empty key');
    }
    if (typeof o.label !== 'string' || o.label.length === 0) {
      throw new BadRequestException(`attribute "${o.key}" must have a label`);
    }
    if (!TYPES.includes(o.type as CategoryAttributeType)) {
      throw new BadRequestException(`attribute "${o.key}" has invalid type`);
    }
    const type = o.type as CategoryAttributeType;
    const unit = o.unit === null || o.unit === undefined ? null : String(o.unit);
    if (unit !== null && typeof o.unit !== 'string') {
      throw new BadRequestException(`attribute "${o.key}" unit must be string or null`);
    }
    const def: CategoryAttributeDefinition = {
      key: o.key,
      label: o.label,
      unit,
      type,
    };
    if (type === 'enum') {
      if (!Array.isArray(o.options) || o.options.length === 0) {
        throw new BadRequestException(`attribute "${o.key}" of type enum requires options[]`);
      }
      for (const opt of o.options) {
        if (typeof opt !== 'string') {
          throw new BadRequestException(`attribute "${o.key}" options must be strings`);
        }
      }
      def.options = o.options as string[];
    }
    out.push(def);
  }
  return out;
}
