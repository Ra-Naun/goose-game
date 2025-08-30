import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AsyncApiModule } from 'nestjs-asyncapi';
import { TapGooseGameModule } from 'src/tap-goose-game/tap-goose-game.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { redisConfig } from 'src/config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule.forRoot({
      type: 'single',
      options: {
        host: redisConfig().host,
        port: redisConfig().port,
        username: redisConfig().user,
        password: redisConfig().userPassword,
      },
    }),
    AsyncApiModule,
    PrismaModule,
    AuthModule,
    UserModule,
    TapGooseGameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
