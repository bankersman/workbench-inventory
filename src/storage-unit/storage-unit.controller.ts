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
} from '@nestjs/common';

import { CreateStorageUnitDto } from './dto/create-storage-unit.dto';
import { UpdateStorageUnitDto } from './dto/update-storage-unit.dto';
import { StorageUnitDetail, StorageUnitService } from './storage-unit.service';

@Controller('storage-units')
export class StorageUnitController {
  constructor(private readonly storageUnitService: StorageUnitService) {}

  @Post()
  create(@Body() dto: CreateStorageUnitDto) {
    return this.storageUnitService.create(dto);
  }

  @Get()
  findAll() {
    return this.storageUnitService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<StorageUnitDetail> {
    return this.storageUnitService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStorageUnitDto,
  ): Promise<StorageUnitDetail> {
    return this.storageUnitService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.storageUnitService.remove(id);
  }
}
