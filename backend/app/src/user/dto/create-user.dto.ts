import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    default: 'ra@naun.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    default: 'Ra Naun',
  })
  @IsString()
  username: string;

  @ApiProperty({
    default: 'qwerty1234',
  })
  @IsString()
  password: string;
}
