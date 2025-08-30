import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TOKEN_KEY } from 'src/auth/config';
import { isProduction } from 'src/config/env.config';

export const initSwagger = (app: INestApplication<any>) => {
  if (!isProduction()) {
    const config = new DocumentBuilder()
      .setTitle('Документация API')
      .setDescription('Описание API проекта')
      .setVersion('1.0')
      // по желанию можно добавить ключ API и другие настройки:
      //.addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' }, 'X-API-KEY')
      // или, например, авторизацию через Bearer токен:
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        TOKEN_KEY,
      )
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      ignoreGlobalPrefix: false,
    });

    document.paths = Object.fromEntries(
      Object.entries(document.paths).map(([path, pathItem]) => [
        `/api${path}`,
        pathItem,
      ]),
    );

    SwaggerModule.setup('docs/api', app, document);
  }
};
