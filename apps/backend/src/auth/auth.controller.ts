import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'User ID', example: 'user001' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Password', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto {
  accessToken: string;
  userId: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'ユーザーログイン',
    description: 'Login and get JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    // テスト用の簡易認証
    // 本番環境では、実際のユーザー検証とパスワードハッシュの確認が必要
    const validUsers = ['user001', 'user002', 'test-user'];
    const validPassword = 'password123';

    if (
      !validUsers.includes(loginDto.userId) ||
      loginDto.password !== validPassword
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // JWTトークンを生成
    const payload = { userId: loginDto.userId, sub: loginDto.userId };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      userId: loginDto.userId,
    };
  }
}
