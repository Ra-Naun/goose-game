import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    type: 'string',
    enum: ['ivan@email.com', 'petr@email.com'],
  })
  @IsString()
  email: string;

  @ApiProperty({
    type: 'string',
    enum: ['ivan123', 'petr123'],
  })
  @IsString()
  password: string;
}
