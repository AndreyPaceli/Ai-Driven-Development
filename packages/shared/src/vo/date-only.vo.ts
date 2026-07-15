import { Result, ValueObject, ValueObjectConfig } from '../base';

export type DateOnlyInput = string | Date;

export class DateOnly extends ValueObject<string, ValueObjectConfig> {
  private static readonly INVALID_DATE_ONLY = 'INVALID_DATE_ONLY';

  private constructor(value: string, config?: ValueObjectConfig) {
    super(value, config);
  }

  get asDate(): Date {
    return new Date(`${this.value}T00:00:00.000Z`);
  }

  public static create(value: DateOnlyInput, config?: ValueObjectConfig): DateOnly {
    const result = DateOnly.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  public static tryCreate(value: DateOnlyInput, config?: ValueObjectConfig): Result<DateOnly> {
    try {
      const normalizedValue = DateOnly.normalize(value);
      return Result.ok(new DateOnly(normalizedValue, config));
    } catch (error: any) {
      return Result.fail(error.message ?? DateOnly.INVALID_DATE_ONLY);
    }
  }

  private static normalize(value: DateOnlyInput): string {
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        throw new Error(DateOnly.INVALID_DATE_ONLY);
      }

      return value.toISOString().slice(0, 10);
    }

    const rawValue = value?.trim();
    if (!rawValue) {
      throw new Error(DateOnly.INVALID_DATE_ONLY);
    }

    const plainDateMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (plainDateMatch) {
      const [, yearValue, monthValue, dayValue] = plainDateMatch;
      const year = Number(yearValue);
      const month = Number(monthValue);
      const day = Number(dayValue);
      const normalizedDate = new Date(Date.UTC(year, month - 1, day));
      const isExactDate =
        normalizedDate.getUTCFullYear() === year &&
        normalizedDate.getUTCMonth() === month - 1 &&
        normalizedDate.getUTCDate() === day;

      if (!isExactDate) {
        throw new Error(DateOnly.INVALID_DATE_ONLY);
      }

      return normalizedDate.toISOString().slice(0, 10);
    }

    const parsedDate = new Date(rawValue);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error(DateOnly.INVALID_DATE_ONLY);
    }

    return parsedDate.toISOString().slice(0, 10);
  }
}
