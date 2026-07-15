import { HexColor } from '../../src';

describe('HexColor', () => {
  test('should create with valid 6-digit color', () => {
    const result = HexColor.tryCreate('#1A2B3C');

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('#1A2B3C');
  });

  test('should normalize value with spaces, lowercase and missing #', () => {
    const result = HexColor.tryCreate('  a1b2c3  ');

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('#A1B2C3');
  });

  test('should accept 3-digit format', () => {
    const result = HexColor.tryCreate('#abc');

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('#ABC');
  });

  test('should accept 8-digit format with alpha channel', () => {
    const result = HexColor.tryCreate('#1a2b3cff');

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('#1A2B3CFF');
  });

  test('should accept 4-digit shorthand format with alpha channel', () => {
    const result = HexColor.tryCreate('#abcd');

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('#ABCD');
  });

  test('should fail with invalid characters', () => {
    const result = HexColor.tryCreate('#ZZZZZZ');

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_HEX_COLOR');
  });

  test('should fail with invalid length', () => {
    const result = HexColor.tryCreate('#12345');

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_HEX_COLOR');
  });

  test('should fail when value is undefined', () => {
    const result = HexColor.tryCreate(undefined as unknown as string);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_HEX_COLOR');
  });

  test('should fallback normalized value to empty string when toUpperCase returns undefined', () => {
    const valueWithUndefinedUpper = {
      trim: () => ({
        toUpperCase: () => undefined,
      }),
    } as unknown as string;

    const result = HexColor.tryCreate(valueWithUndefinedUpper);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_HEX_COLOR');
  });

  test('should create with create when value is valid', () => {
    const color = HexColor.create('aabbcc');

    expect(color.value).toBe('#AABBCC');
  });

  test('should throw when using create with invalid value', () => {
    expect(() => HexColor.create('blue')).toThrow();
  });

  test('should fallback to default error when an unknown error is thrown', () => {
    const trimSpy = jest.spyOn(String.prototype, 'trim').mockImplementation(() => {
      throw {};
    });

    try {
      const result = HexColor.tryCreate('aabbcc');

      expect(result.isFailure).toBe(true);
      expect(result.errors).toContain('INVALID_HEX_COLOR');
    } finally {
      trimSpy.mockRestore();
    }
  });
});
