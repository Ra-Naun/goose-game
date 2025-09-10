import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { UserController } from './user.controller';
import { ExternalCacheService } from 'src/external-cache/external-cache.service';
import { PubSubService } from 'src/pub-sub/pub-sub.service';
import { UserGateway } from './user.gateway';

@Module({
  controllers: [UserController],
  providers: [UserGateway, UsersService, ExternalCacheService, PubSubService],
  exports: [UsersService],
})
export class UserModule { }
