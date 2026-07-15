import { Result, ValueObject, ValueObjectConfig } from '../base';

interface PersonNameConfig extends ValueObjectConfig {}

export class PersonName extends ValueObject<string, PersonNameConfig> {
  private static readonly TOO_SHORT = 'NAME_TOO_SHORT';
  private static readonly TOO_LONG = 'NAME_TOO_LONG';
  private static readonly MUST_HAVE_FIRST_AND_LAST_NAME = 'MUST_HAVE_FIRST_AND_LAST_NAME';

  constructor(value?: string, config?: PersonNameConfig) {
    super(PersonName.ensureValid(value ?? ''), config);
  }

  get firstName(): string {
    return this.value.split(/\s+/)[0]!;
  }

  get lastNames(): string[] {
    return this.value.split(/\s+/).slice(1);
  }

  get lastName(): string {
    const names = this.lastNames;
    return names[names.length - 1]!;
  }

  get initials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`;
  }

  public static create(value: string, config?: PersonNameConfig): PersonName {
    const result = PersonName.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  public static tryCreate(value: string, config?: PersonNameConfig): Result<PersonName> {
    try {
      return Result.ok(new PersonName(PersonName.ensureValid(value), config));
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }

  private static ensureValid(value: string): string {
    const trimmedValue = value.trim();
    const min = 3;
    const max = 50;

    if (trimmedValue.length < min) {
      throw new Error(PersonName.TOO_SHORT);
    }
    if (trimmedValue.length > max) {
      throw new Error(PersonName.TOO_LONG);
    }

    const words = trimmedValue.split(/\s+/).filter((w) => w.length > 0);
    if (words.length < 2) {
      throw new Error(PersonName.MUST_HAVE_FIRST_AND_LAST_NAME);
    }
    const first = words[0]!;
    const last = words[words.length - 1]!;
    if (first.length < 2 || last.length < 2) {
      throw new Error(PersonName.TOO_SHORT);
    }

    const validNameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ'`´^~\- ]+$/;
    if (!validNameRegex.test(trimmedValue)) {
      throw new Error(PersonName.MUST_HAVE_FIRST_AND_LAST_NAME);
    }

    return trimmedValue;
  }
}
