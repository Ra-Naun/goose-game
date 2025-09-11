import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsPlayersRecord', async: false })
export class IsScoresRecordConstraint implements ValidatorConstraintInterface {
  validate(scores: any, _args: ValidationArguments) {
    if (typeof scores !== 'object' || scores === null || Array.isArray(scores))
      return false;
    return Object.values(scores).every((v) => typeof v === 'number');
  }
  defaultMessage(_args: ValidationArguments) {
    return 'scores must be an object with string keys and number values';
  }
}
