import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsPlayersRecord', async: false })
export class IsPlayersRecordConstraint implements ValidatorConstraintInterface {
  validate(players: any, _args: ValidationArguments) {
    if (
      typeof players !== 'object' ||
      players === null ||
      Array.isArray(players)
    )
      return false;
    return Object.values(players).every((v) => typeof v === 'number');
  }
  defaultMessage(_args: ValidationArguments) {
    return 'players must be an object with string keys and number values';
  }
}
