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

  it('should login with valid credentials', () => {
    const result = service.login('user001', 'password123');

    expect(result).toEqual({
      accessToken: 'test-token',
      userId: 'user001',
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      userId: 'user001',
      sub: 'user001',
    });
  });

  it('should throw UnauthorizedException for invalid userId', () => {
    expect(() => service.login('invalid-user', 'password123')).toThrow(
      UnauthorizedException,
    );
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException for invalid password', () => {
    expect(() => service.login('user001', 'invalid-password')).toThrow(
      UnauthorizedException,
    );
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});
