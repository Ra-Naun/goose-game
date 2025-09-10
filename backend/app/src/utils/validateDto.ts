import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export const validateDto = async function validatePubSubMessage<
  T extends object,
>(dtoClass: new () => T, message: any): Promise<T> {
  const instance = plainToInstance(dtoClass, message);
  const errors = await validate(instance);
  if (errors.length) {
    const className = instance.constructor.name;
    throw new Error(`Validation failed for DTO ${className}: ${errors}`);
  }
  return instance;
};
