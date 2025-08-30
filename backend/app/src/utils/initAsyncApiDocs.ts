import { INestApplication } from '@nestjs/common';
import {
  AsyncApiDocumentBuilder,
  AsyncApiModule,
  AsyncServerObject,
} from 'nestjs-asyncapi';
import { isProduction } from 'src/config/env.config';

export const initAsyncApiDocs = async (app: INestApplication<any>) => {
  if (!isProduction()) {
    const asyncApiServer: AsyncServerObject = {
      url: 'ws://localhost:3000/api/tap-goose-game/socket.io',
      protocol: 'socket.io',
    };

    const asyncApiOptions = new AsyncApiDocumentBuilder()
      .setTitle('WebSocket API')
      .setDescription('AsyncAPI specification for WebSocket API')
      .setVersion('1.0')
      .setDefaultContentType('application/json')
      .addServer('tap-goose-ws', asyncApiServer)
      .build();

    const asyncApiDocument = AsyncApiModule.createDocument(
      app,
      asyncApiOptions,
    );

    await AsyncApiModule.setup('/docs/async-api', app, asyncApiDocument);
  }
};
