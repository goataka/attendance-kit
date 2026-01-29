import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './auth.controller';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(userId: string, password: string): LoginResponseDto {
    // テスト用の簡易認証
    // 本番環境では、実際のユーザー検証とパスワードハッシュの確認が必要
    const validUsers = ['user001', 'user002', 'test-user'];
    const validPassword = 'password123';

    if (!validUsers.includes(userId) || password !== validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId, sub: userId };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      userId,
    };
  }
}
