import { Result } from '../../src';

describe('Domain errors with Result', () => {
  const userErrors = {
    NOT_FOUND: 'USER_NOT_FOUND',
    EMAIL_EXISTS: 'USER_EMAIL_ALREADY_EXISTS',
  } as const;

  test('Result.fail wraps string into Message with code', () => {
    const result = Result.fail(userErrors.NOT_FOUND);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.code).toBe('USER_NOT_FOUND');
  });

  test('withFail preserves error codes', () => {
    const original = Result.fail<string>(userErrors.NOT_FOUND);
    const propagated: Result<number> = original.withFail;

    expect(propagated.errors).toHaveLength(1);
    expect(propagated.errors[0]?.code).toBe('USER_NOT_FOUND');
  });
});
