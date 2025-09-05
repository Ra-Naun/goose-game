import { TOKEN_KEY } from './config';

export type LoginReturnPayload = { username: string; sub: string };

export type LoginReturn = {
  [TOKEN_KEY]: string;
};

export type LogoutReturn = {
  message: string;
};

export type RegisterReturn = {
  [TOKEN_KEY]: string;
};
