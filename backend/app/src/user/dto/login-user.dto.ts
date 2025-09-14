import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export interface LoginUserData {
  password: string;
  email: string;
}

export class LoginUserDto implements LoginUserData {
  @ApiProperty({
    type: 'string',
    enum: ['ivan@email.com', 'petr@email.com'],
  })
  @IsString()
  email!: string;

  @ApiProperty({
    type: 'string',
    enum: ['ivan123', 'petr123'],
  })
  @IsString()
  password!: string;
}
