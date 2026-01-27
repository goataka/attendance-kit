import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string; // User ID
  userId: string;
  username?: string;
}

// JWT_SECRETの検証
const jwtSecret = process.env.JWT_SECRET?.trim();
if (!jwtSecret) {
  console.error('ERROR: JWT_SECRET environment variable is not set or is empty');
  throw new Error('JWT_SECRET environment variable is required and must not be empty');
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub && !payload.userId) {
      throw new UnauthorizedException();
    }
    return {
      userId: payload.userId || payload.sub,
      username: payload.username,
    };
  }
}
