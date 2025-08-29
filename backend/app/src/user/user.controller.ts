import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './user.service';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UserRole } from './dto/types';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { TOKEN_KEY } from 'src/auth/config';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersService) { }

  @ApiBearerAuth(TOKEN_KEY)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@Request() req): Omit<UserDto, 'hashedPassword'> | null {
    if (!req.user) {
      return null;
    }

    const { hashedPassword: _, ...otherData } = req.user as UserDto;
    return otherData;
  }

  @ApiBearerAuth(TOKEN_KEY)
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateCurrentUser(
    @Request() req,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDto | null> {
    console.log('~| req.user', req.user);

    await this.userService.update(req.user.id as UserDto['id'], dto);
    return this.userService.findById(req.user.id as UserDto['id']);
  }

  @ApiBearerAuth(TOKEN_KEY)
  @ApiBody({
    type: CreateUserDto,
    description: 'Json structure for admin user object',
  })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Post('register-admin')
  async registerAdmin(@Body() dto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(dto, true);
  }
}
