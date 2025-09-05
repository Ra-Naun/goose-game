import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { UserController } from './user.controller';
import { ExternalCacheService } from 'src/external-cache/external-cache.service';

@Module({
  controllers: [UserController],
  providers: [UsersService, ExternalCacheService],
  exports: [UsersService],
})
export class UserModule {}
