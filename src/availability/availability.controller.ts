import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { AvailabilityService } from './availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('items/:itemId')
  getItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.availabilityService.getItemAvailability(itemId);
  }

  @Get('projects/:projectId')
  getProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.availabilityService.getProjectAvailability(projectId);
  }
}
