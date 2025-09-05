import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import type { JwtRequest } from 'src/types/request-user';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { LoginReturn, LogoutReturn, RegisterReturn } from './types';
import { TOKEN_KEY } from './config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({
    type: LoginUserDto,
    description: 'Json structure for user object',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: JwtRequest): Promise<LoginReturn> {
    return this.authService.login(req.user);
  }

  @ApiBearerAuth(TOKEN_KEY)
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req: JwtRequest): Promise<LogoutReturn> {
    return this.authService.logout();
  }

  @ApiBody({
    type: CreateUserDto,
    description: 'Json structure for user object',
  })
  @Post('register')
  async register(@Body() dto: CreateUserDto): Promise<RegisterReturn> {
    return this.authService.register(dto);
  }
}
