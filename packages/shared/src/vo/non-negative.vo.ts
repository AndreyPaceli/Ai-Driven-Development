import { Result } from '../base';
import { ValidationError } from '../base/validation-error';
import { Metadata } from '../base/metadata';

export class NonNegative {
  constructor(
    readonly value: number,
    meta?: Metadata,
  ) {
    if (this.value < 0) {
      throw new ValidationError({
        code: 'non-negative.invalid',
        meta: meta?.withValue(value).props,
      });
    }
  }

  static create(value: number, meta?: Metadata): NonNegative {
    const result = NonNegative.tryCreate(value, meta);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  static tryCreate(value: number, meta?: Metadata): Result<NonNegative> {
    return Result.try(() => new NonNegative(value, meta));
  }
}
