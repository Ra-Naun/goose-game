import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './dto/types';

export const getUserRoleOnCreate = (
  createUserDto: CreateUserDto,
  isAdmin: boolean = false,
): UserRole[] => {
  if (isAdmin) {
    return [UserRole.ADMIN];
  }
  if (createUserDto.username === 'Никита') {
    return [UserRole.USER, UserRole.NIKITA];
  }
  return [UserRole.USER];
};
