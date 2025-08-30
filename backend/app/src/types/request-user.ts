import { Request as ExpressRequest } from 'express';

import { UserDto } from 'src/user/dto/user.dto';

export interface JwtRequest extends ExpressRequest {
  user: UserDto;
}
