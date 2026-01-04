import { Module } from '@nestjs/common';
import { ClockController } from './clock.controller';
import { ClockService } from './clock.service';

@Module({
  controllers: [ClockController],
  providers: [ClockService],
})
export class ClockModule {}
