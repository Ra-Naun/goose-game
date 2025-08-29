import { TOKEN_KEY } from './config';

export type LoginReturnPayload = { username: string; sub: string };

export type LoginReturn = {
  [TOKEN_KEY]: string;
};
