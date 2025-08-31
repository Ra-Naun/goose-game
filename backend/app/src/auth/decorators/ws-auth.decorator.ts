import { UnauthorizedException } from '@nestjs/common';
import {
  extractTokenFromHandshake,
  validateRequestAndSetUserIfIsValid,
} from '../guards/ws-auth.guard';
import type { JwtSocket } from 'src/types/socket-user';

// Фабрика для внедрения зависимостей

export function WsAuthDecorator() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const client: JwtSocket = args[0];
      const token = extractTokenFromHandshake(client);
      try {
        await validateRequestAndSetUserIfIsValid(
          client,
          token,
          this.jwtService,
          this.usersService,
        );
      } catch (error) {
        console.log('WebSocket auth failed:', error.message);
        client.disconnect(true);
        return;
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
