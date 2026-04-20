import { Controller, Get, Header, Post } from '@nestjs/common';

import { SupplierRefreshService } from '../suppliers/supplier-refresh.service';
import {
  mouserShoppingListText,
  orderListToCsv,
  tmeShoppingListText,
} from './order-list-export.util';
import { OrderListService } from './order-list.service';

@Controller('order-list')
export class OrderListController {
  constructor(
    private readonly orderListService: OrderListService,
    private readonly supplierRefreshService: SupplierRefreshService,
  ) {}

  @Get()
  async list() {
    const entries = await this.orderListService.list();
    const lowStock = entries.filter((e) => e.reasons.includes('low_stock'));
    const projectGaps = entries.filter((e) => e.reasons.includes('project_gap'));
    return { lowStock, projectGaps, all: entries };
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="order-list.csv"')
  async exportCsv(): Promise<string> {
    const entries = await this.orderListService.list();
    return orderListToCsv(entries);
  }

  @Get('export/mouser.txt')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  async exportMouser(): Promise<string> {
    const entries = await this.orderListService.list();
    return mouserShoppingListText(entries);
  }

  @Get('export/tme.txt')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  async exportTme(): Promise<string> {
    const entries = await this.orderListService.list();
    return tmeShoppingListText(entries);
  }

  @Post('refresh-prices')
  async refreshPrices() {
    return this.supplierRefreshService.refreshAll();
  }
}
