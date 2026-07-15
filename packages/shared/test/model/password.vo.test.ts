import { Password } from '../../src';

test('Deve retornar uma senha', () => {
  expect(new Password('123').value).toBeDefined();
  expect(new Password('abc123').value).toBeDefined();
  expect(new Password('%%StrongPassword123').value).toBeDefined();
});

test('Deve lançar erro com senha vazia', () => {
  expect(() => new Password(undefined as any)).toThrow('password.empty');
  expect(() => new Password('')).toThrow('password.empty');
  expect(() => new Password('     ')).toThrow('password.empty');
});

test('Deve tentar criar uma senha com sucesso', () => {
  const password = Password.tryCreate('123');
  expect(password.isOk).toBe(true);
});

test('Deve tentar criar uma senha inválida', () => {
  const password = Password.tryCreate('    ');
  expect(password.isOk).toBe(false);
  expect(password.errors[0]?.code).toBe('password.empty');
});

test('Deve criar uma senha válida via create', () => {
  const password = Password.create('secret123');
  expect(password.value).toBe('secret123');
});

test('Deve lançar ao criar senha inválida via create', () => {
  expect(() => Password.create('')).toThrow();
});
