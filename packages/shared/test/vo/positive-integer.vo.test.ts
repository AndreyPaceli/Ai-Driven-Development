import { PositiveInteger } from '../../src';

describe('PositiveInteger', () => {
  test('should create with valid positive integer starting from 1', () => {
    const result = PositiveInteger.tryCreate(1);

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe(1);
  });

  test('should fail when value is zero or negative', () => {
    const zero = PositiveInteger.tryCreate(0);
    const negative = PositiveInteger.tryCreate(-1);

    expect(zero.isFailure).toBe(true);
    expect(zero.errors).toContain('INVALID_POSITIVE_INTEGER');
    expect(negative.isFailure).toBe(true);
    expect(negative.errors).toContain('INVALID_POSITIVE_INTEGER');
  });

  test('should fail when value is not integer', () => {
    const result = PositiveInteger.tryCreate(1.5);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_POSITIVE_INTEGER');
  });

  test('should fail when value is not finite number', () => {
    const nan = PositiveInteger.tryCreate(Number.NaN);
    const positiveInfinity = PositiveInteger.tryCreate(Number.POSITIVE_INFINITY);

    expect(nan.isFailure).toBe(true);
    expect(nan.errors).toContain('INVALID_POSITIVE_INTEGER');
    expect(positiveInfinity.isFailure).toBe(true);
    expect(positiveInfinity.errors).toContain('INVALID_POSITIVE_INTEGER');
  });

  test('should fail when value is not a number', () => {
    const result = PositiveInteger.tryCreate('1' as unknown as number);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_POSITIVE_INTEGER');
  });

  test('should throw when create receives invalid value', () => {
    expect(() => PositiveInteger.create(0)).toThrow();
  });

  test('should create with create when value is valid', () => {
    const value = PositiveInteger.create(2);

    expect(value.value).toBe(2);
  });

  test('should return default invalid error when unexpected error has no message', () => {
    const isIntegerSpy = jest.spyOn(Number, 'isInteger').mockImplementation(() => {
      throw {};
    });

    const result = PositiveInteger.tryCreate(1);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_POSITIVE_INTEGER');
    isIntegerSpy.mockRestore();
  });
});
