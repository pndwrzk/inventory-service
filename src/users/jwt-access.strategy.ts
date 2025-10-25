import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtData, JwtUser } from 'src/common/interface/jwt-user';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'accessSecret',
    });
  }

  async validate(payload: JwtData): Promise<JwtUser> {
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}
