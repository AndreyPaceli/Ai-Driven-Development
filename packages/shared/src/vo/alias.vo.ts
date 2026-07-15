import { Result, ValueObject, ValueObjectConfig } from '../base';
import { ValidationError } from '../base/validation-error';

export class Alias extends ValueObject<string, ValueObjectConfig> {
  private static readonly INVALID_ALIAS = 'INVALID_ALIAS';

  constructor(value: string, config?: ValueObjectConfig) {
    if (!Alias.isValid(value)) {
      throw new ValidationError({ code: 'alias.invalid' });
    }

    super(value, config);
  }

  public static create(value: string, config?: ValueObjectConfig): Alias {
    const result = Alias.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  public static format(value: string, allowTrailingHyphen = false): string {
    if (typeof value !== 'string') {
      return '';
    }

    const normalizedValue = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const hasTrailingSeparator = /[^a-z0-9]$/.test(normalizedValue);

    const formattedValue = normalizedValue
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!allowTrailingHyphen || !hasTrailingSeparator || !formattedValue) {
      return formattedValue;
    }

    return `${formattedValue}-`;
  }

  public static isValid(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    const normalized = value.toLowerCase();
    if (value !== normalized) {
      return false;
    }
    if (normalized !== normalized.trim()) {
      return false;
    }
    if (/\s/.test(normalized)) {
      return false;
    }

    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized);
  }

  public static tryCreate(value: string, config?: ValueObjectConfig): Result<Alias> {
    try {
      if (typeof value !== 'string') {
        throw new Error(Alias.INVALID_ALIAS);
      }

      const normalized = value.toLowerCase();

      if (normalized !== normalized.trim()) {
        throw new Error(Alias.INVALID_ALIAS);
      }
      if (/\s/.test(normalized)) {
        throw new Error(Alias.INVALID_ALIAS);
      }
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
        throw new Error(Alias.INVALID_ALIAS);
      }

      return Result.ok(new Alias(normalized, config));
    } catch (error: any) {
      return Result.fail(error.message ?? Alias.INVALID_ALIAS);
    }
  }
}
