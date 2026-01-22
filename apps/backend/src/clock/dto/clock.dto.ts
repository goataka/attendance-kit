import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export enum ClockType {
  CLOCK_IN = 'clock-in',
  CLOCK_OUT = 'clock-out',
}

export class ClockInDto {
  @ApiProperty({
    description: 'Location where clock-in occurred',
    example: 'Tokyo Office',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Device ID used for clock-in',
    example: 'device-abc123',
    required: false,
  })
  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class ClockOutDto {
  @ApiProperty({
    description: 'Location where clock-out occurred',
    example: 'Tokyo Office',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Device ID used for clock-out',
    example: 'device-abc123',
    required: false,
  })
  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class ClockRecordResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'user123',
  })
  userId: string;

  @ApiProperty({
    description: 'Timestamp in ISO 8601 format',
    example: '2025-12-25T09:00:00Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Date in YYYY-MM-DD format',
    example: '2025-12-25',
  })
  date: string;

  @ApiProperty({
    description: 'Clock type',
    enum: ClockType,
    example: ClockType.CLOCK_IN,
  })
  type: ClockType;

  @ApiProperty({
    description: 'Location',
    example: 'Tokyo Office',
    required: false,
  })
  location?: string;

  @ApiProperty({
    description: 'Device ID',
    example: 'device-abc123',
    required: false,
  })
  deviceId?: string;
}
