import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { LoginResponseDto } from './dto/auth.dto';

// テスト用の認証情報
const VALID_USERS = ['user001', 'user002', 'test-user'] as const;
const VALID_PASSWORD = 'password123';

@Injectable()
export class AuthService {
  constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

  login(userId: string, password: string): LoginResponseDto {
    // テスト用の簡易認証
    // 本番環境では、実際のユーザー検証とパスワードハッシュの確認が必要
    if (!VALID_USERS.includes(userId as any) || password !== VALID_PASSWORD) {
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
