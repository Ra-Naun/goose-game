import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    default: 'ra@naun.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    default: 'qwerty1234',
  })
  @IsString()
  password: string;
}
