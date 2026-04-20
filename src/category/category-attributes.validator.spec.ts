import { BadRequestException } from '@nestjs/common';

import { assertValidCategoryAttributes } from './category-attributes.validator';

describe('assertValidCategoryAttributes', () => {
  it('accepts a valid enum attribute', () => {
    const attrs = assertValidCategoryAttributes([
      {
        key: 'package',
        label: 'Package',
        unit: null,
        type: 'enum',
        options: ['0402', '0603'],
      },
    ]);
    expect(attrs).toHaveLength(1);
    expect(attrs[0]?.options).toEqual(['0402', '0603']);
  });

  it('rejects invalid type', () => {
    expect(() =>
      assertValidCategoryAttributes([{ key: 'x', label: 'X', unit: null, type: 'boolean' }]),
    ).toThrow(BadRequestException);
  });

  it('rejects enum without options', () => {
    expect(() =>
      assertValidCategoryAttributes([{ key: 'x', label: 'X', unit: null, type: 'enum' }]),
    ).toThrow(BadRequestException);
  });
});
