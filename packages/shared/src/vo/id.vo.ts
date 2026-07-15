import { Result } from '../base/result';
import { ValueObject, ValueObjectConfig } from '../base/vo';
import { v4 as uuidv4 } from 'uuid';

export class Id extends ValueObject<string, ValueObjectConfig> {
  protected static readonly INVALID_ID: string = 'INVALID_ID';
  constructor(value: string, config?: ValueObjectConfig) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const idValue = value?.trim().toLowerCase();
    if (!uuidRegex.test(idValue)) {
      throw new Error('id.invalid');
    }
    super(idValue, config);
  }

  public static create(this: typeof Id, value?: string | undefined, config?: ValueObjectConfig): Id {
    const result = this.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  public static tryCreate(this: typeof Id, value?: string | undefined, config?: ValueObjectConfig): Result<Id> {
    try {
      const hasValue = value !== undefined && value !== null && value !== '';
      const idValue = hasValue ? value!.trim().toLowerCase() : uuidv4();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(idValue)) {
        throw new Error(this.INVALID_ID);
      }
      return Result.ok(new this(idValue, config));
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }

  public static createUUID(): string {
    return uuidv4();
  }

  public static required(this: typeof Id, value: string, config?: ValueObjectConfig): Result<Id> {
    if (!value) {
      return Result.fail(this.INVALID_ID);
    }
    const result = this.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result;
  }
}
