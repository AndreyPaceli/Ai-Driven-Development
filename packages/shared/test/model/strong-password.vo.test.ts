import { StrongPassword, ValidationError } from '../../src';

const error = 'strong-password.too-weak';

test('Deve lançar erro com senha vazia', () => {
  expect(() => new StrongPassword()).toThrow(error);
  expect(() => new StrongPassword('')).toThrow(error);
});

test('Deve lançar erro com senha apenas com números', () => {
  expect(() => new StrongPassword('1234567890')).toThrow(error);
});

test('Deve lançar erro com senha apenas com letras', () => {
  expect(() => new StrongPassword('AbCdEfGhIj')).toThrow(error);
});

test('Deve lançar erro com senha sem letras minúsculas', () => {
  expect(() => new StrongPassword('ABC12345!')).toThrow(error);
});

test('Deve lançar erro com senha sem caractere especial', () => {
  expect(() => new StrongPassword('Password1')).toThrow(error);
});

test('Deve lançar erro com senha apenas com caracteres especiais', () => {
  expect(() => new StrongPassword('!@#$%¨&*()_+')).toThrow(error);
});

test('Deve lançar erro com senha com menos de 8 caracteres', () => {
  expect(() => new StrongPassword('%S3nh4%')).toThrow(error);
});

test('Deve criar senha forte', () => {
  const pass = 'S3nh4F0rt3%';
  expect(new StrongPassword(pass).value).toBe(pass);
});

test('Deve tentar criar uma senha com sucesso', () => {
  const password = StrongPassword.tryCreate('S3nh4F0rt3%');
  expect(password.isOk).toBe(true);
});

test('Deve tentar criar uma senha inválida', () => {
  const password = StrongPassword.tryCreate('1234567890');
  expect(password.isOk).toBe(false);
  expect(password.errors[0]?.code).toBe('strong-password.too-weak');
});
