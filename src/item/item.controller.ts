import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { AdjustQuantityDto } from './dto/adjust-quantity.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemListQuery, ItemService, QuantityAdjustmentResult } from './item.service';

function parseOptionalInt(raw: unknown): number | undefined {
  if (raw === undefined || raw === null || raw === '') {
    return undefined;
  }
  const n = Number(raw);
  if (Number.isNaN(n) || !Number.isInteger(n)) {
    return undefined;
  }
  return n;
}

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  create(@Body() dto: CreateItemDto) {
    return this.itemService.create(dto);
  }

  @Get()
  findAll(@Query() queryParams: Record<string, unknown>) {
    const q = typeof queryParams.q === 'string' ? queryParams.q.trim() : undefined;
    const query: ItemListQuery = {
      q: q || undefined,
      categoryId: parseOptionalInt(queryParams.categoryId),
      containerId: parseOptionalInt(queryParams.containerId),
      storageUnitId: parseOptionalInt(queryParams.storageUnitId),
      attr: ItemService.parseAttrFromQuery(queryParams),
    };
    return this.itemService.findMany(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateItemDto) {
    return this.itemService.update(id, dto);
  }

  @Post(':id/adjust-quantity')
  adjustQuantity(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdjustQuantityDto,
  ): Promise<QuantityAdjustmentResult> {
    return this.itemService.adjustQuantity(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.itemService.remove(id);
  }
}
