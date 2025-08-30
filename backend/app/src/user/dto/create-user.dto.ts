import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    default: 'ivan@email.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    default: 'Ivan',
  })
  @IsString()
  username: string;

  @ApiProperty({
    default: 'ivan123',
  })
  @IsString()
  password: string;
}
