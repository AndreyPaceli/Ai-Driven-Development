import { ValidationError } from '../base/validation-error';
import { Metadata } from '../base/metadata';
import { Result } from '../base';

export class Cpf {
  readonly formatted: string;

  constructor(value: string, meta?: Metadata) {
    const v = Cpf.onlyNumbers(value);

    if (!Cpf.isValid(v)) {
      throw new ValidationError({
        code: 'cpf.invalid',
        meta: {
          ...meta,
          value: Cpf.format(v),
        },
      });
    }

    this.formatted = Cpf.format(v);
  }

  static create(value: string, meta?: Metadata): Cpf {
    const result = Cpf.tryCreate(value, meta);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  static tryCreate(value: string, meta?: Metadata): Result<Cpf> {
    return Result.try(() => new Cpf(value, meta));
  }

  get value() {
    return this.formatted;
  }

  get unformatted() {
    return Cpf.onlyNumbers(this.formatted);
  }

  static format(v: string) {
    const numbers = Cpf.onlyNumbers(v).split('');
    return numbers.reduce((cpf, num) => {
      const dot = [3, 7].includes(cpf.length) ? '.' : '';
      const dash = [11].includes(cpf.length) ? '-' : '';
      return `${cpf}${dot}${dash}${num}`;
    }, '');
  }

  static isValid(cpf: string): boolean {
    if (!cpf) return false;
    const nums = cpf.split('').filter((v) => '0123456789'.includes(v));
    if (nums.length !== 11) return false;

    const v1 = this.validateCheckDigit(nums.slice(0, 9), nums[9]!);
    const v2 = this.validateCheckDigit(nums.slice(0, 10), nums[10]!);
    return v1 && v2;
  }

  private static onlyNumbers(cpf: string): string {
    return cpf
      .split('')
      .filter((v) => '0123456789'.includes(v))
      .filter((_, i) => i < 11)
      .join('');
  }

  private static validateCheckDigit(digits: string[], providedDigit: string) {
    const total = digits.reduce((sum, digit, index) => {
      const factor = digits.length + 1 - index;
      return sum + +digit * factor;
    }, 0);

    const remainder = total % 11;
    const calculatedDigit = remainder < 2 ? 0 : 11 - remainder;
    return calculatedDigit === +providedDigit;
  }
}
