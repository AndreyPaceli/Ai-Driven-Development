import { Result } from '../base';
import { Metadata } from '../base/metadata';
import { ValidationError } from '../base/validation-error';

export class EncryptedPassword {
  static readonly REGEX = /^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9\.\/]{53}$/;

  constructor(
    readonly value?: string,
    readonly meta?: Metadata,
  ) {
    if (!value || !EncryptedPassword.isValid(value)) {
      throw new ValidationError({
        code: 'encrypted-password.invalid',
        meta: { ...meta?.props, value: undefined },
      });
    }
  }

  static create(value?: string, meta?: Metadata): EncryptedPassword {
    const result = EncryptedPassword.tryCreate(value, meta);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  static tryCreate(value?: string, meta?: Metadata): Result<EncryptedPassword> {
    return Result.try(() => new EncryptedPassword(value, meta));
  }

  static isValid(hash: string): boolean {
    return EncryptedPassword.REGEX.test(hash);
  }
}
