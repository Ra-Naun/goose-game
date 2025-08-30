export const redisConfig = () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT as string, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  user: process.env.REDIS_USER || undefined,
  userPassword: process.env.REDIS_USER_PASSWORD || undefined,
});
