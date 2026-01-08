import { Module } from '@nestjs/common';
import { ClockModule } from './clock/clock.module';

@Module({
  imports: [ClockModule],
})
export class AppModule {}
