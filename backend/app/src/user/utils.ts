import { CreateUserDto } from './dto/create-user.dto';
import { UserRoleEnum } from './dto/types';

export const getUserRoleOnCreate = (
  createUserDto: CreateUserDto,
): UserRoleEnum[] => {
  if (createUserDto.username === 'Никита') {
    return [UserRoleEnum.USER, UserRoleEnum.NIKITA];
  }
  return [UserRoleEnum.USER];
};
