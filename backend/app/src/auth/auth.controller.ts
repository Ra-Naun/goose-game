import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { LoginReturn } from './types';
import { TOKEN_KEY } from './config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiBody({
    type: LoginUserDto,
    description: 'Json structure for user object',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req): Promise<LoginReturn> {
    return this.authService.login(req.user as UserDto);
  }

  @ApiBearerAuth(TOKEN_KEY)
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req): Promise<{ message: string }> {
    return this.authService.logout();
  }

  @ApiBody({
    type: CreateUserDto,
    description: 'Json structure for user object',
  })
  @Post('register')
  async register(@Body() dto: CreateUserDto): Promise<LoginReturn> {
    // Пример установки безопасных cookie в контроллере или сервисе:
    //   res.cookie('token', jwtToken, {
    //   httpOnly: true,         // cookie недоступна через JS
    //   secure: isProduction(), // только по HTTPS в продакшн
    //   sameSite: 'strict',     // cookie только для первого сайта
    //   maxAge: 60 * 60 * 1000, // 1 час
    //   path: '/',              // доступна на всём сайте
    // });
    return this.authService.register(dto);
  }
}
