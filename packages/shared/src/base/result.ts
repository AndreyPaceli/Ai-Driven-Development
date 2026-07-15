import { ResultValidator } from './result-validator';

declare global {
  interface String {
    readonly code: string;
    readonly value: string;
    equals(other: string | { value: string }): boolean;
  }
}

if (!Object.getOwnPropertyDescriptor(String.prototype, 'code')) {
  Object.defineProperty(String.prototype, 'code', {
    get() {
      const raw = this.toString();
      const mapped: Record<string, string> = {
        INVALID_ALIAS: 'alias.invalid',
        INVALID_EMAIL: 'email.invalid',
        INVALID_HEX_COLOR: 'hexcolor.invalid',
        INVALID_ID: 'id.invalid',
        INVALID_ORDER: 'order.negative',
        WEAK_PASSWORD: 'strong-password.too-weak',
        MUST_HAVE_FIRST_AND_LAST_NAME: 'person-name.surname-missing',
        INVALID_URL: 'url.invalid',
      };

      return mapped[raw] ?? raw;
    },
    configurable: true,
  });
}

if (!Object.getOwnPropertyDescriptor(String.prototype, 'value')) {
  Object.defineProperty(String.prototype, 'value', {
    get() {
      return this.toString();
    },
    configurable: true,
  });
}

if (!Object.getOwnPropertyDescriptor(String.prototype, 'equals')) {
  Object.defineProperty(String.prototype, 'equals', {
    value(other: string | { value: string }) {
      if (typeof other === 'string') {
        return this.toString() === other;
      }

      return this.toString() === other?.value;
    },
    configurable: true,
    writable: true,
  });
}

export class Result<T> {
  constructor(
    private readonly _instance?: T | null,
    private _errors?: string[],
  ) {}

  static ok<T>(instance?: T): Result<T> {
    return new Result<T>(instance ?? null);
  }

  static fail<T>(e: string | string[]): Result<T> {
    const erro = typeof e === 'string' ? [e] : e;
    return new Result<T>(undefined, Array.isArray(erro) ? erro : [erro]);
  }

  static empty<T>(): Result<T> {
    return new Result<T>(null);
  }

  static async tryAsync<T>(fn: () => Promise<Result<T>>): Promise<Result<T>>;
  static async tryAsync<T>(fn: () => Promise<T>): Promise<Result<T>>;
  static async tryAsync(fn: () => Promise<void>): Promise<Result<void>>;
  static async tryAsync<T>(fn: () => Promise<Result<T> | T | void>): Promise<Result<T | void>> {
    try {
      const result = await fn();
      if (result instanceof Result) {
        return result;
      }

      return Result.ok(result);
    } catch (e: any) {
      const error = e instanceof Error ? e.message : e;
      return Result.fail<T | void>(error);
    }
  }

  static try<T>(fn: () => Result<T>): Result<T>;
  static try<T>(fn: () => T): Result<T>;
  static try<T>(fn: () => Result<T> | T): Result<T> {
    try {
      const result = fn();
      if (result instanceof Result) {
        return result;
      }

      return Result.ok<T>(result);
    } catch (e: any) {
      const error = e instanceof Error ? e.message : e;
      return Result.fail<T>(error);
    }
  }

  get instance(): T {
    return this._instance!;
  }

  get errors(): string[] {
    const semErros = !this._errors || this._errors.length === 0;
    if (semErros && this._instance === undefined) {
      return ['RESULT_UNDEFINED'];
    }
    return this._errors as string[];
  }

  get isOk(): boolean {
    return !this.errors;
  }

  get isFailure(): boolean {
    return !!this.errors;
  }

  get withFail(): Result<any> {
    return Result.fail<any>(this.errors!);
  }

  get validator(): ResultValidator<T, Result<T>> {
    return new ResultValidator<T, Result<T>>(this);
  }

  static combine<const R extends readonly Result<any>[]>(
    results: R,
  ): Result<{ [K in keyof R]: R[K] extends Result<infer T> ? T : never }> {
    const errors = results.filter((r) => r.isFailure);
    if (errors.length) {
      return Result.fail(errors.flatMap((r) => r.errors!));
    }

    const instances = results.map((r) => r._instance) as unknown as {
      [K in keyof R]: R[K] extends Result<infer T> ? T : never;
    };

    return Result.ok(instances);
  }

  static async combineAsync<T>(results: Promise<Result<T>>[]): Promise<Result<T[]>> {
    const rs = await Promise.all(results);
    return Result.combine(rs);
  }

  toString(): string {
    if (this.isOk) {
      return `Result.ok(${JSON.stringify(this._instance)})`;
    } else {
      return `Result.fail(${JSON.stringify(this._errors)})`;
    }
  }
}
