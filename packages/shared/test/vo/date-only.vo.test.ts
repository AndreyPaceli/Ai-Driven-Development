import { DateOnly } from '../../src';

describe('DateOnly', () => {
  test('should create valid date-only with create', () => {
    const value = DateOnly.create('2026-03-16');

    expect(value.value).toBe('2026-03-16');
  });

  test('should create valid date-only from ISO string', () => {
    const result = DateOnly.tryCreate('2026-03-16');

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('2026-03-16');
  });

  test('should trim value before normalizing', () => {
    const result = DateOnly.tryCreate(' 2026-03-16 ');

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('2026-03-16');
  });

  test('should normalize full datetime strings to date-only', () => {
    const result = DateOnly.tryCreate('2026-03-16T15:45:30.000Z');

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('2026-03-16');
  });

  test('should create from date instance', () => {
    const result = DateOnly.tryCreate(new Date('2026-03-16T23:59:59.000Z'));

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('2026-03-16');
    expect(result.instance.asDate.toISOString()).toBe('2026-03-16T00:00:00.000Z');
  });

  test('should fail when date is invalid', () => {
    const result = DateOnly.tryCreate('2026-02-30');

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_DATE_ONLY');
  });

  test('should fail when receives an invalid date instance', () => {
    const result = DateOnly.tryCreate(new Date('invalid'));

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_DATE_ONLY');
  });

  test('should fail when value is empty', () => {
    const result = DateOnly.tryCreate('   ');

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_DATE_ONLY');
  });

  test('should fallback to default error when thrown value has no message', () => {
    const originalNormalize = (DateOnly as any).normalize;
    (DateOnly as any).normalize = () => {
      throw {};
    };

    const result = DateOnly.tryCreate('2026-03-16');

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_DATE_ONLY');

    (DateOnly as any).normalize = originalNormalize;
  });

  test('should throw when create receives invalid value', () => {
    expect(() => DateOnly.create('invalid-date')).toThrow('INVALID_DATE_ONLY');
  });
});
