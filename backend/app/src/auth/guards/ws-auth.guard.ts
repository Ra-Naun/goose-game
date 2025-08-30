import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import type { JwtSocket } from 'src/types/socket-user';
import { UsersService } from 'src/user/user.service';

export const validateRequestAndSetUserIfIsValid = async (
  client: JwtSocket,
  token: string | null,
  jwtService: JwtService,
  usersService: UsersService,
) => {
  if (!token) {
    throw new UnauthorizedException('No auth token');
  }

  try {
    const payload = await jwtService.verifyAsync(token);
    const user = await usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    client.user = user;
    return true;
  } catch (e) {
    throw new UnauthorizedException('Invalid auth token');
  }
};

export const extractTokenFromHandshake = (client: Socket): string | null => {
  const { token } = client.handshake.query;
  if (typeof token === 'string') return token;
  const authHeader = client.handshake.headers['authorization'];
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
};

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: JwtSocket = context.switchToWs().getClient<JwtSocket>();
    const token = extractTokenFromHandshake(client);
    try {
      await validateRequestAndSetUserIfIsValid(
        client,
        token,
        this.jwtService,
        this.usersService,
      );
    } catch (error) {
      client.disconnect(true);
      return false;
    }
    return true;
  }
}
