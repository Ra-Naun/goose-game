import { JwtService } from '@nestjs/jwt';
import { validateRequestAndSetUserIfIsValid } from 'src/auth/utils';
import type { JwtSocket } from 'src/types/socket-user';
import { UsersService } from 'src/user/user.service';

export const authMiddleware =
  (jwtService: JwtService, usersService: UsersService) =>
    async (socket: JwtSocket, next) => {
      try {
        const token =
          socket.handshake.auth?.token || socket.handshake.query?.token;

        await validateRequestAndSetUserIfIsValid(
          socket,
          token,
          jwtService,
          usersService,
        );
        next();
      } catch (err) {
        return next(new Error('Authentication error'));
      }
    };
