import { Module } from '@nestjs/common';
import { TapGooseGameService } from './tap-goose-game.service';
import { TapGooseGameGateway } from './tap-goose-game.gateway';
import { PubSubService } from '../pub-sub/pub-sub.service';
import { ExternalCacheService } from 'src/external-cache/external-cache.service';
import { UsersService } from 'src/user/user.service';
import { dynamicJwtConfig } from 'src/auth/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { TapGooseGameController } from './tap-goose-game.controller';
import { MatchSchedulerService } from './match-scheduler.service';
import { HelperService } from './helper.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: dynamicJwtConfig().secret,
    }),
  ],
  controllers: [TapGooseGameController],
  providers: [
    TapGooseGameGateway,
    PubSubService,
    ExternalCacheService,
    MatchSchedulerService,
    TapGooseGameService,
    PrismaService,
    UsersService,
    HelperService,
  ],
})
export class TapGooseGameModule { }
