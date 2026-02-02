import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClockController } from './clock.controller';
import { ClockService } from './clock.service';

@Module({
  imports: [ConfigModule],
  controllers: [ClockController],
  providers: [ClockService],
  exports: [ClockService],
})
export class ClockModule {}
