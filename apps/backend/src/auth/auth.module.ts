import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';

// JWT_SECRETの検証とデフォルト値の設定
const jwtSecret = process.env.JWT_SECRET?.trim();
if (!jwtSecret) {
  console.error('ERROR: JWT_SECRET environment variable is not set or is empty');
  throw new Error('JWT_SECRET environment variable is required and must not be empty');
}

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
