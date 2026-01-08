import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ClockService } from './clock.service';
import { ClockInRequest, ClockOutRequest, ClockEvent, ClockRecord, ApiResponse } from '@attendance-kit/types';

@Controller()
export class ClockController {
  constructor(private readonly clockService: ClockService) {}

  @Post('clock-in')
  async clockIn(@Body() request: ClockInRequest): Promise<ApiResponse<ClockEvent>> {
    try {
      const event = await this.clockService.clockIn(request);
      return {
        success: true,
        data: event,
        message: 'Clock in successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Post('clock-out')
  async clockOut(@Body() request: ClockOutRequest): Promise<ApiResponse<ClockEvent>> {
    try {
      const event = await this.clockService.clockOut(request);
      return {
        success: true,
        data: event,
        message: 'Clock out successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('records')
  async getRecords(@Query('userId') userId?: string): Promise<ApiResponse<ClockRecord[]>> {
    try {
      const records = await this.clockService.getRecords(userId);
      return {
        success: true,
        data: records,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
