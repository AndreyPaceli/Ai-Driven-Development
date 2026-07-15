import { DayOfMonth } from '../../src';

describe('DayOfMonth', () => {
  test('should create with valid day of month', () => {
    const result = DayOfMonth.tryCreate(15);

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe(15);
  });

  test('should accept boundary values', () => {
    const firstDay = DayOfMonth.tryCreate(1);
    const lastDay = DayOfMonth.tryCreate(31);

    expect(firstDay.isOk).toBe(true);
    expect(firstDay.instance.value).toBe(1);
    expect(lastDay.isOk).toBe(true);
    expect(lastDay.instance.value).toBe(31);
  });

  test('should fail when value is below allowed range', () => {
    const result = DayOfMonth.tryCreate(0);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('DAY_OF_MONTH_OUT_OF_RANGE');
  });

  test('should fail when value is above allowed range', () => {
    const result = DayOfMonth.tryCreate(32);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('DAY_OF_MONTH_OUT_OF_RANGE');
  });

  test('should fail when value is not an integer', () => {
    const result = DayOfMonth.tryCreate(10.5);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_DAY_OF_MONTH');
  });

  test('should fail when value is not finite', () => {
    const result = DayOfMonth.tryCreate(Number.NaN);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_DAY_OF_MONTH');
  });

  test('should fail when value is not a number', () => {
    const result = DayOfMonth.tryCreate('10' as unknown as number);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_DAY_OF_MONTH');
  });

  test('should create with create when value is valid', () => {
    const day = DayOfMonth.create(10);

    expect(day.value).toBe(10);
  });

  test('should throw when create receives invalid day', () => {
    expect(() => DayOfMonth.create(40)).toThrow('DAY_OF_MONTH_OUT_OF_RANGE');
  });

  test('should fallback to default error when an unknown error is thrown', () => {
    const isIntegerSpy = jest.spyOn(Number, 'isInteger').mockImplementation(() => {
      throw {};
    });

    try {
      const result = DayOfMonth.tryCreate(10);

      expect(result.isFailure).toBe(true);
      expect(result.errors).toContain('INVALID_DAY_OF_MONTH');
    } finally {
      isIntegerSpy.mockRestore();
    }
  });
});
