import { Module } from '@nestjs/common';
import { ClockController } from './clock.controller';
import { ClockService } from './clock.service';

@Module({
  controllers: [ClockController],
  providers: [ClockService],
  exports: [ClockService],
})
export class ClockModule {}
