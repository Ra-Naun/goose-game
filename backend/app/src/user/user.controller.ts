import {
  Controller,
  Get,
  Body,
  Patch,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import { UsersService } from './user.service';
import { OnlineUsers, SerializedUserForUI, UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UserRoleEnum } from './dto/types';
import { TOKEN_KEY } from 'src/auth/config';
import { checkIsUserHasRequiredRole } from 'src/auth/guards/roles.guard';
import type { JwtRequest } from 'src/types/request-user';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersService) { }

  @ApiBearerAuth(TOKEN_KEY)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@Request() req: JwtRequest): SerializedUserForUI | null {
    if (!req.user) {
      return null;
    }

    return UserDto.serializeForUI(req.user);
  }

  @ApiBearerAuth(TOKEN_KEY)
  @UseGuards(JwtAuthGuard)
  @Patch('user')
  async updateCurrentUser(
    @Request() req: JwtRequest,
    @Body() dto: UpdateUserDto,
  ): Promise<SerializedUserForUI | null> {
    if (req.user.id !== dto.id) {
      const requiredRoles = [UserRoleEnum.ADMIN];
      const isValidPermissions = checkIsUserHasRequiredRole(
        req.user,
        requiredRoles,
      );

      if (!isValidPermissions) {
        throw new ForbiddenException('Access denied');
      }
    }

    await this.userService.update(req.user.id, dto);
    const userDto = await this.userService.findById(req.user.id);
    if (!userDto) {
      return null;
    }
    return UserDto.serializeForUI(userDto);
  }

  @ApiBearerAuth(TOKEN_KEY)
  @UseGuards(JwtAuthGuard)
  @Get('online-users')
  async getOnlineUsers(): Promise<OnlineUsers> {
    const usersInfo = await this.userService.getOnlineUsers();
    return usersInfo;
  }
}
