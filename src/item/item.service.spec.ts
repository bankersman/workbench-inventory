import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../entities/category.entity';
import { Container } from '../entities/container.entity';
import { Item } from '../entities/item.entity';
import { ItemService } from './item.service';

describe('ItemService', () => {
  describe('parseAttrFromQuery', () => {
    it('parses attr[key]=value bracket form', () => {
      expect(
        ItemService.parseAttrFromQuery({
          'attr[package]': '0603',
          q: 'cap',
        }),
      ).toEqual({ package: '0603' });
    });

    it('merges nested attr object when present', () => {
      expect(
        ItemService.parseAttrFromQuery({
          attr: { package: '0805', foo: '1' },
        }),
      ).toEqual({ package: '0805', foo: '1' });
    });
  });

  describe('adjustQuantity', () => {
    let service: ItemService;
    let save: jest.Mock;
    let findOne: jest.Mock;

    beforeEach(async () => {
      save = jest.fn(async (x: Item) => x);
      findOne = jest.fn();
      const itemRepo = {
        findOne,
        save,
        createQueryBuilder: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      };
      const containerRepo = { exist: jest.fn() };
      const categoryRepo = { exist: jest.fn() };

      const moduleRef: TestingModule = await Test.createTestingModule({
        providers: [
          ItemService,
          {
            provide: getRepositoryToken(Item),
            useValue: itemRepo as unknown as Repository<Item>,
          },
          {
            provide: getRepositoryToken(Container),
            useValue: containerRepo as unknown as Repository<Container>,
          },
          {
            provide: getRepositoryToken(Category),
            useValue: categoryRepo as unknown as Repository<Category>,
          },
        ],
      }).compile();

      service = moduleRef.get(ItemService);
    });

    it('rejects negative resulting quantity', async () => {
      findOne.mockResolvedValue({
        id: 1,
        quantity: 2,
      } as Item);

      await expect(service.adjustQuantity(1, { delta: -5, reason: 'test' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('applies delta and returns adjustment summary', async () => {
      const item = { id: 1, quantity: 10 } as Item;
      findOne.mockResolvedValue(item);
      save.mockImplementation(async (i: Item) => i);

      const result = await service.adjustQuantity(1, { delta: 3, reason: 'received' });
      expect(result.previousQuantity).toBe(10);
      expect(result.newQuantity).toBe(13);
      expect(result.delta).toBe(3);
      expect(result.reason).toBe('received');
      expect(save).toHaveBeenCalled();
    });
  });
});
