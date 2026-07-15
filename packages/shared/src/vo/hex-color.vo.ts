import { Result, ValueObject, ValueObjectConfig } from '../base';

export class HexColor extends ValueObject<string, ValueObjectConfig> {
  private static readonly INVALID_HEX_COLOR = 'INVALID_HEX_COLOR';

  constructor(value: string, config?: ValueObjectConfig) {
    const normalized = value?.trim() ?? '';
    if (!HexColor.isValid(normalized)) {
      throw new Error('hexcolor.invalid');
    }

    super(normalized, config);
  }

  public static create(value: string, config?: ValueObjectConfig): HexColor {
    const result = HexColor.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  public static tryCreate(value: string, config?: ValueObjectConfig): Result<HexColor> {
    try {
      const normalized = value?.trim().toUpperCase() ?? '';
      const withPrefix = normalized.startsWith('#') ? normalized : `#${normalized}`;
      if (!HexColor.isValid(withPrefix)) {
        throw new Error(HexColor.INVALID_HEX_COLOR);
      }

      return Result.ok(new HexColor(withPrefix, config));
    } catch (error: any) {
      return Result.fail(error.message ?? HexColor.INVALID_HEX_COLOR);
    }
  }

  public static isValid(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }

    const regex = /^#(?:[0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/;
    return regex.test(value.trim().toUpperCase());
  }
}
