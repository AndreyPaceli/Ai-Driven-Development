import { Result } from '../base';
import { Metadata } from '../base/metadata';
import { ValidationError } from '../base/validation-error';

export class Password {
  constructor(
    readonly value?: string,
    readonly meta?: Metadata,
  ) {
    if (!value?.trim()) {
      throw new ValidationError({
        code: 'password.empty',
        meta: { ...meta?.props, value: undefined },
      });
    }
  }

  static create(value?: string, meta?: Metadata): Password {
    const result = Password.tryCreate(value, meta);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  static tryCreate(value?: string, meta?: Metadata): Result<Password> {
    return Result.try(() => new Password(value, meta));
  }
}
