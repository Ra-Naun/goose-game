import { INestApplication } from '@nestjs/common';
import helmet, { HelmetOptions } from 'helmet';

const HELMET_OPTIONS: Readonly<HelmetOptions> = {
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'default-src': ["'self'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'script-src': ["'self'"],
      'object-src': ["'none'"],
      // Добавьте другие директивы по необходимости
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'no-referrer' },
  xssFilter: true,
  noSniff: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  // отключите или настройте другие политики по необходимости
};

export const initHelmet = (app: INestApplication<any>) => {
  app.use(helmet(HELMET_OPTIONS));
};
