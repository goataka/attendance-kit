import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('正しい認証情報でログインできること', () => {
    // Given: 有効なユーザーIDとパスワード
    // When: login関数を呼び出す
    const result = service.login('user001', 'password123');

    // Then: JWTトークンとユーザーIDが返される
    expect(result).toEqual({
      accessToken: 'test-token',
      userId: 'user001',
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      userId: 'user001',
      sub: 'user001',
    });
  });

  it('無効なユーザーIDでは認証エラーとなること', () => {
    // Given: 無効なユーザーIDと有効なパスワード
    // When: login関数を呼び出す
    // Then: UnauthorizedException例外が発生する
    expect(() => service.login('invalid-user', 'password123')).toThrow(
      UnauthorizedException,
    );
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('無効なパスワードでは認証エラーとなること', () => {
    // Given: 有効なユーザーIDと無効なパスワード
    // When: login関数を呼び出す
    // Then: UnauthorizedException例外が発生する
    expect(() => service.login('user001', 'invalid-password')).toThrow(
      UnauthorizedException,
    );
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});
