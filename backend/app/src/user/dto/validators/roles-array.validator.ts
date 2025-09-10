import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsPlayersRecord', async: false })
export class IsUserRoleArrayConstraint implements ValidatorConstraintInterface {
  validate(roles: any, _args: ValidationArguments) {
    if (!Array.isArray(roles)) return false;
    return roles.every((role) => typeof role === 'string');
  }
  defaultMessage(_args: ValidationArguments) {
    return 'players must be an object with string keys and number values';
  }
}
