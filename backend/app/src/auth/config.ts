export const dynamicJwtConfig = () => ({
  secret: process.env.JWT_SECRET || '',
  expiresIn: process.env.JWT_EXPIRATION || '30d',
});

export const TOKEN_KEY = 'token';
