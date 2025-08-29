import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { dynamicJwtConfig } from '../config';
import { LoginReturnPayload } from '../types';
import { UsersService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: dynamicJwtConfig().secret,
    });
  }

  async validate(payload: LoginReturnPayload) {
    // Здесь же мы можем выполнить дополнительную проверку токена,
    // например, найти его в списке отозванных токенов, что позволит нам отзывать токены

    const user = await this.usersService.findById(payload.sub);
    return user;
  }
}
