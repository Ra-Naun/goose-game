import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtSocket } from 'src/types/socket-user';
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
