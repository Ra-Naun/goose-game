import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { MatchPlayerInfoDto } from '../';
import { validateDto } from 'src/utils/validateDto';

@ValidatorConstraint({ name: 'IsPlayersRecord', async: true })
export class IsPlayersRecordConstraint implements ValidatorConstraintInterface {
  async validate(players: any, _args: ValidationArguments) {
    if (
      typeof players !== 'object' ||
      players === null ||
      Array.isArray(players)
    )
      return false;
    const keys = Object.keys(players);
    const allStringKeys = keys.every((k) => typeof k === 'string');
    if (!allStringKeys) return false;
    const values = Object.values(players);

    const allValuesValidPromise = values.map(async (v) => {
      try {
        await validateDto(MatchPlayerInfoDto, v);
        return true;
      } catch {
        return false;
      }
    });
    const allValuesValid = await Promise.all(allValuesValidPromise);
    return allValuesValid.every((v) => v === true);
  }
  defaultMessage(_args: ValidationArguments) {
    return 'players must be an object with string keys and MatchPlayerInfoDto values';
  }
}
