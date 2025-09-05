import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleEnum } from 'src/user/dto/types';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserDto } from 'src/user/dto/user.dto';
import type { JwtRequest } from 'src/types/request-user';

export const checkIsUserHasRequiredRole = (
  user: UserDto,
  roles: UserRoleEnum[],
): boolean => {
  return roles.some((role) => user.roles.includes(role));
};
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }
    const req: JwtRequest = context.switchToHttp().getRequest();

    const user: UserDto | undefined = req.user;
    if (!user) {
      return false;
    }

    return checkIsUserHasRequiredRole(user, requiredRoles);
  }
}
