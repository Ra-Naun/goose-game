import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UsersService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { comparePasswords } from 'services/crypto';
import { UserDto } from 'src/user/dto/user.dto';
import { LoginReturn, LoginReturnPayload } from './types';
import { TOKEN_KEY } from './config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await comparePasswords(pass, user.hashedPassword))) {
      return user;
    }
    return null;
  }

  async login(user: UserDto): Promise<LoginReturn> {
    const payload: LoginReturnPayload = {
      username: user.username,
      sub: user.id,
    };
    return {
      [TOKEN_KEY]: await this.jwtService.signAsync(payload),
    };
  }

  async logout(): Promise<{ message: string }> {
    // Для JWT стратегии logout обычно реализуется на клиенте путем удаления токена.
    // На сервере можно просто вернуть сообщение об успешном выходе.
    // Можно также реализовать черный список токенов, если требуется.
    return { message: 'You have successfully logged out' };
  }

  async register(dto: CreateUserDto) {
    try {
      const user = await this.usersService.create(dto);
      return this.login(user);
    } catch (err) {
      throw new ForbiddenException('Registration error');
    }
  }
}
