import { Module } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { ClockModule } from './clock/clock.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health.controller';

// Lambda環境ではprocess.envから直接読み込み、ローカル開発環境では.envファイルを使用
const getConfigModuleOptions = (): ConfigModuleOptions => {
  const isLambdaEnvironment = ['production', 'eva', 'stg', 'prod'].includes(
    process.env.NODE_ENV || '',
  );

  return {
    isGlobal: true,
    ignoreEnvFile: isLambdaEnvironment,
    envFilePath: isLambdaEnvironment ? undefined : '.env',
  };
};

@Module({
  imports: [
    ConfigModule.forRoot(getConfigModuleOptions()),
    ClockModule,
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
