import { Cpf, ValidationError } from '../../src';

test('Deve validar um CPF', () => {
  const cpf = new Cpf('12345678909');
  expect(cpf.formatted).toBe('123.456.789-09');
  expect(cpf.value).toBe('123.456.789-09');
});

test('Deve lançar erro ao tentar criar um CPF inválido', () => {
  expect(() => new Cpf('12345678900')).toThrow('cpf.invalid');
});

test('Deve desformatar um CPF', () => {
  const cpf = new Cpf('123.456.789-09');
  expect(cpf.unformatted).toBe('12345678909');
});

test('Deve validar um CPF', () => {
  expect(Cpf.isValid(null as any)).toBe(false);
  expect(Cpf.isValid('')).toBe(false);
  expect(Cpf.isValid('123')).toBe(false);
  expect(Cpf.isValid('12345678909')).toBe(true);
});

test('Deve criar um CPF válido via create', () => {
  const cpf = Cpf.create('12345678909');
  expect(cpf.formatted).toBe('123.456.789-09');
});

test('Deve lançar ao criar um CPF inválido via create', () => {
  expect(() => Cpf.create('12345678900')).toThrow();
});

test('Deve tentar criar um CPF com sucesso', () => {
  const cpf = Cpf.tryCreate('12345678909');
  expect(cpf.isOk).toBe(true);
});

test('Deve tentar criar um CPF inválido', () => {
  const cpf = Cpf.tryCreate('12345678900');
  expect(cpf.isOk).toBe(false);
  expect(cpf.errors[0]?.code).toBe('cpf.invalid');
});
