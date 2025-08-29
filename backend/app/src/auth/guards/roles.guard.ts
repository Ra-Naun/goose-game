import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/user/dto/types';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserDto } from 'src/user/dto/user.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    console.log('~| requiredRoles', requiredRoles);

    if (!requiredRoles) {
      return true;
    }
    const req = context.switchToHttp().getRequest();

    const user: UserDto | undefined = req.user;
    console.log('~| user', user);
    if (!user) {
      return false;
    }

    console.log('~| user.roles', user.roles);

    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
