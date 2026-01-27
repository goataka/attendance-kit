import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClockModule } from './clock/clock.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'dev',
      envFilePath: '.env',
    }),
    ClockModule,
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
