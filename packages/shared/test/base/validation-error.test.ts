import { ValidationError } from '../../src';
import type { Message } from '../../src/base/message';

test('Deve criar um ValidationError com uma falha', () => {
  const msg: Message = {
    code: 'email.not-valid',
    meta: { module: 'auth', object: 'user', attribute: 'email' },
  };

  const error = new ValidationError(msg, 422);

  expect(error.codes).toBe('email.not-valid');
  expect(error.message).toBe('email.not-valid');
  expect(error.status).toBe(422);
  expect(error.messages).toHaveLength(1);
  expect(error.messages[0]).toBe(msg);
});

test("Deve usar 'validation-error' como código padrão se code não for fornecido", () => {
  const error = new ValidationError({
    meta: { module: 'auth', object: 'user', attribute: 'email' },
  });

  expect(error.codes).toBe('validation-error');
  expect(error.message).toBe('validation-error');
  expect(error.status).toBe(400);
  expect(error.messages[0]?.meta?.module).toBe('auth');
});

test('Deve criar um ValidationError com várias falhas', () => {
  const error = new ValidationError(
    [
      {
        code: 'email.not-valid',
        meta: { module: 'auth', object: 'user', attribute: 'email' },
      },
      {
        code: 'password.not-valid',
        meta: { module: 'auth', object: 'user', attribute: 'password' },
      },
    ],
    400,
  );

  expect(error.codes).toBe('email.not-valid,password.not-valid');
  expect(error.message).toBe('email.not-valid,password.not-valid');
  expect(error.status).toBe(400);
  expect(error.messages).toHaveLength(2);
  expect(error.messages[0]?.meta?.attribute).toBe('email');
  expect(error.messages[1]?.meta?.attribute).toBe('password');
});
