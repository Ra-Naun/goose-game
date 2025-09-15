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
import { ChatModule } from 'src/chat/chat.module';
import { JwtModule } from '@nestjs/jwt';
import { dynamicJwtConfig } from 'src/auth/config';

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
    JwtModule.register({
      global: true,
      secret: dynamicJwtConfig().secret,
      signOptions: { expiresIn: dynamicJwtConfig().expiresIn },
    }),
    AsyncApiModule,
    PrismaModule,
    AuthModule,
    UserModule,
    ChatModule,
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
