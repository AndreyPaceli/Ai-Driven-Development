import { Result, ValueObject, ValueObjectConfig } from '../base';

export class DayOfMonth extends ValueObject<number, ValueObjectConfig> {
  private static readonly INVALID_DAY_OF_MONTH = 'INVALID_DAY_OF_MONTH';
  private static readonly DAY_OF_MONTH_OUT_OF_RANGE = 'DAY_OF_MONTH_OUT_OF_RANGE';

  private constructor(value: number, config?: ValueObjectConfig) {
    super(value, config);
  }

  public static create(value: number, config?: ValueObjectConfig): DayOfMonth {
    const result = DayOfMonth.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  public static tryCreate(value: number, config?: ValueObjectConfig): Result<DayOfMonth> {
    try {
      if (typeof value !== 'number') {
        throw new Error(DayOfMonth.INVALID_DAY_OF_MONTH);
      }

      if (!Number.isFinite(value)) {
        throw new Error(DayOfMonth.INVALID_DAY_OF_MONTH);
      }

      if (!Number.isInteger(value)) {
        throw new Error(DayOfMonth.INVALID_DAY_OF_MONTH);
      }

      if (value < 1 || value > 31) {
        throw new Error(DayOfMonth.DAY_OF_MONTH_OUT_OF_RANGE);
      }

      return Result.ok(new DayOfMonth(value, config));
    } catch (error: any) {
      return Result.fail(error.message ?? DayOfMonth.INVALID_DAY_OF_MONTH);
    }
  }
}
