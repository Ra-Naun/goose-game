import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
}
export class CreateUserDto implements CreateUserData {
  @ApiProperty({
    default: 'ivan@email.com',
  })
  @IsString()
  email!: string;

  @ApiProperty({
    default: 'Ivan',
  })
  @IsString()
  username!: string;

  @ApiProperty({
    default: 'ivan123',
  })
  @IsString()
  password!: string;
}
