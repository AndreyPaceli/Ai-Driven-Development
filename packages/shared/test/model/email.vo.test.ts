import { Email, ValidationError } from '../../src';

const error = 'email.invalid';

test('Deve criar um email válido', () => {
  const email = new Email('fulano@zmail.com');
  expect(email.value).toBe('fulano@zmail.com');
});

test('Deve retornar o nome do usuário', () => {
  const email = new Email('fulano@zmail.com');
  expect(email.username).toBe('fulano');
});

test('Deve retornar o domínio', () => {
  const email = new Email('fulano@zmail.com');
  expect(email.domain).toBe('zmail.com');
});

test('Deve validar email', () => {
  expect(Email.isValid('user@email.com')).toBeTruthy();
  expect(Email.isValid('user@email')).toBeFalsy();
});

test('Deve lançar erro ao criar um email inválido', () => {
  expect(() => new Email(undefined as any)).toThrow(error);
  expect(() => new Email('')).toThrow(error);
  expect(() => new Email('fulano')).toThrow(error);
  expect(() => new Email('fulano@zmail')).toThrow(error);
});

test('Deve tentar criar um email com sucesso', () => {
  const email = Email.tryCreate('johndoe@example.com');
  expect(email.isOk).toBe(true);
});

test('Deve tentar criar um email inválido', () => {
  const email = Email.tryCreate('invalid-email@');
  expect(email.isOk).toBe(false);
  expect(email.errors[0]?.code).toBe('email.invalid');
});
