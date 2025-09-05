import { Module } from '@nestjs/common';
import { TapGooseGameService } from './tap-goose-game.service';
import { TapGooseGameGateway } from './tap-goose-game.gateway';
import { TapGooseGamePubSubService } from './pub-sub.service';
import { ExternalCacheService } from 'src/external-cache/external-cache.service';
import { UsersService } from 'src/user/user.service';
import { dynamicJwtConfig } from 'src/auth/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { TapGooseGameController } from './tap-goose-game.controller';
import { MatchSchedulerService } from './match-scheduler.service';

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
    TapGooseGamePubSubService,
    MatchSchedulerService,
    TapGooseGameService,
    ExternalCacheService,
    PrismaService,
    UsersService,
  ],
})
export class TapGooseGameModule {}
