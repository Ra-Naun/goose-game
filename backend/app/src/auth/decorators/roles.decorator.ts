import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/user/dto/types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => {
  console.log('~| SetMetadata roles', roles);

  return SetMetadata(ROLES_KEY, roles);
};
