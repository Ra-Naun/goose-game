import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import { hashPassword } from 'services/crypto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { getUserRoleOnCreate as getUserRolesOnCreate } from './utils';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async findByEmail(email: User['email']): Promise<UserDto | null> {
    const item = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!item) {
      return null;
    }

    const userDto = UserDto.fromDatabaseItem(item);
    return userDto;
  }

  async findById(id: User['id']): Promise<UserDto | null> {
    const item = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!item) {
      return null;
    }

    const userDto = UserDto.fromDatabaseItem(item);
    return userDto;
  }

  async create(dto: CreateUserDto, isAdmin: boolean = false): Promise<UserDto> {
    const { password, email, username } = dto;
    const roles = getUserRolesOnCreate(dto, isAdmin);
    const hashedPassword = await hashPassword(password);

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const item = await this.prisma.user.create({
      data: { username, email, roles, hashedPassword },
    });

    const userDto = UserDto.fromDatabaseItem(item);
    return userDto;
  }

  async update(id: User['id'], dto: UpdateUserDto): Promise<UserDto> {
    const { password, ...other } = dto;

    const updateData = {
      ...(password ? { hashedPassword: await hashPassword(password) } : {}),
      ...other,
    };

    const item = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const userDto = UserDto.fromDatabaseItem(item);
    return userDto;
  }
}
