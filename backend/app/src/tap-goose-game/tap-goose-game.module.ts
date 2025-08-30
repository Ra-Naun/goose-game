import { Module } from '@nestjs/common';
import { TapGooseGameService } from './tap-goose-game.service';
import { TapGooseGameGateway } from './tap-goose-game.gateway';
import { TapGooseGamePubSubService } from './pub-sub.service';
import { ExternalCacheService } from 'src/external-cache/external-cache.service';
import { UsersService } from 'src/user/user.service';
import { dynamicJwtConfig } from 'src/auth/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: dynamicJwtConfig().secret,
    }),
  ],
  providers: [
    TapGooseGameGateway,
    TapGooseGamePubSubService,
    TapGooseGameService,
    ExternalCacheService,
    UsersService,
  ],
})
export class TapGooseGameModule { }
