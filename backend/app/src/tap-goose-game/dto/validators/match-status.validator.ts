import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { MatchStatus } from 'src/tap-goose-game/types';

@ValidatorConstraint({ name: 'IsMatchStatus', async: false })
export class IsMatchStatusConstraint implements ValidatorConstraintInterface {
  validate(status: any, _args: ValidationArguments) {
    return [
      MatchStatus.WAITING,
      MatchStatus.ONGOING,
      MatchStatus.FINISHED,
    ].includes(status);
  }
  defaultMessage(_args: ValidationArguments) {
    return 'match status must be an enum value of MatchStatus - WAITING, ONGOING, or FINISHED';
  }
}
