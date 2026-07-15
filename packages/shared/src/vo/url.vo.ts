import { Result, ValueObject, ValueObjectConfig } from '../base';
import { ValidationError } from '../base/validation-error';

export class Url extends ValueObject<string, ValueObjectConfig> {
  private static readonly INVALID_URL = 'INVALID_URL';

  constructor(value?: string, config?: ValueObjectConfig) {
    const normalized = value?.trim();
    if (!normalized || !Url.isValid(normalized)) {
      throw new ValidationError({ code: 'url.invalid' });
    }

    super(normalized, config);
  }

  get domain(): string {
    return new globalThis.URL(this.value).hostname;
  }

  get protocol(): string {
    return new globalThis.URL(this.value).protocol;
  }

  get pathname(): string {
    return new globalThis.URL(this.value).pathname;
  }

  get parameters(): Record<string, string> {
    const params = new globalThis.URL(this.value).searchParams;
    return Object.fromEntries(params.entries());
  }

  public static isValid(value: string): boolean {
    try {
      const parsed = new globalThis.URL(value);
      return /^https?:$/.test(parsed.protocol);
    } catch {
      return false;
    }
  }

  public static create(value: string, config?: ValueObjectConfig): Url {
    const result = Url.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  public static tryCreate(value: string, config?: ValueObjectConfig): Result<Url> {
    try {
      const url = value.trim();
      if (!Url.isValid(url)) {
        throw new Error(Url.INVALID_URL);
      }
      return Result.ok(new Url(url, config));
    } catch {
      return Result.fail(Url.INVALID_URL);
    }
  }
}

export class URL extends Url {
  constructor(value?: string, config?: ValueObjectConfig) {
    super(value, config);
  }
}
