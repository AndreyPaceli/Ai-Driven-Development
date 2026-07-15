import { Result } from './result';

interface HasTryCreate<T> {
  tryCreate(value: unknown): Result<T>;
}

export function optional<T>(value: unknown | undefined, vo: HasTryCreate<T>): Result<T> | undefined {
  return value !== undefined ? vo.tryCreate(value) : undefined;
}
