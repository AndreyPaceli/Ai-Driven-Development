import { Result, ValueObject, ValueObjectConfig } from '../base';

export class PositiveInteger extends ValueObject<number, ValueObjectConfig> {
  private static readonly INVALID_POSITIVE_INTEGER = 'INVALID_POSITIVE_INTEGER';

  private constructor(value: number, config?: ValueObjectConfig) {
    super(value, config);
  }

  public static create(value: number, config?: ValueObjectConfig): PositiveInteger {
    const result = PositiveInteger.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  public static tryCreate(value: number, config?: ValueObjectConfig): Result<PositiveInteger> {
    try {
      if (typeof value !== 'number') {
        throw new Error(PositiveInteger.INVALID_POSITIVE_INTEGER);
      }
      if (!Number.isFinite(value)) {
        throw new Error(PositiveInteger.INVALID_POSITIVE_INTEGER);
      }
      if (!Number.isInteger(value)) {
        throw new Error(PositiveInteger.INVALID_POSITIVE_INTEGER);
      }
      if (value < 1) {
        throw new Error(PositiveInteger.INVALID_POSITIVE_INTEGER);
      }

      return Result.ok(new PositiveInteger(value, config));
    } catch (error: any) {
      return Result.fail(error.message ?? PositiveInteger.INVALID_POSITIVE_INTEGER);
    }
  }
}
