import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { initSwagger } from './utils/initSwager';
import { initHelmet } from './utils/initHelmet';
import cookieParser from 'cookie-parser';

import { ValidationPipe } from '@nestjs/common';
import { initAsyncApiDocs } from './utils/initAsyncApiDocs';
import { getHost, getPort } from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  initHelmet(app);
  initSwagger(app);
  await initAsyncApiDocs(app);
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.enableCors({
    origin: [getHost()],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(getPort() ?? 3000);
}

bootstrap();
