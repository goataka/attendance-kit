import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClockService } from './clock.service';
import {
  ClockInDto,
  ClockOutDto,
  ClockRecordResponseDto,
} from './dto/clock.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../shared/types/request.types';

@ApiTags('clock')
@Controller('clock')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClockController {
  constructor(
    @Inject(ClockService) private readonly clockService: ClockService,
  ) {}

  @Post('in')
  @ApiOperation({ summary: '出勤打刻', description: 'Register clock-in time' })
  @ApiResponse({
    status: 201,
    description: 'Clock-in recorded successfully',
    type: ClockRecordResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async clockIn(
    @Req() req: AuthenticatedRequest,
    @Body() clockInDto: ClockInDto,
  ): Promise<ClockRecordResponseDto> {
    const userId = req.user.userId;
    return this.clockService.clockIn(
      userId,
      clockInDto.location,
      clockInDto.deviceId,
    );
  }

  @Post('out')
  @ApiOperation({ summary: '退勤打刻', description: 'Register clock-out time' })
  @ApiResponse({
    status: 201,
    description: 'Clock-out recorded successfully',
    type: ClockRecordResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async clockOut(
    @Req() req: AuthenticatedRequest,
    @Body() clockOutDto: ClockOutDto,
  ): Promise<ClockRecordResponseDto> {
    const userId = req.user.userId;
    return this.clockService.clockOut(
      userId,
      clockOutDto.location,
      clockOutDto.deviceId,
    );
  }

  @Get('records')
  @ApiOperation({
    summary: '打刻記録一覧取得',
    description: 'Get all clock records for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of clock records',
    type: [ClockRecordResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRecords(
    @Req() req: AuthenticatedRequest,
  ): Promise<ClockRecordResponseDto[]> {
    const userId = req.user.userId;
    return this.clockService.getRecords(userId);
  }
}
