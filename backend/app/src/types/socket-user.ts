import { Socket } from 'socket.io';
import { UserDto } from 'src/user/dto';

export interface JwtSocket extends Socket {
  user: UserDto;
}
