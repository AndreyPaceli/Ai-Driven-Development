import { Alias, ValidationError } from '../../src';

test('Deve criar um Alias válido', () => {
  const alias = new Alias('valid-alias');
  expect(alias.value).toBe('valid-alias');
});

test('Deve lançar ValidationError para um alias inválido', () => {
  expect(() => new Alias('Invalid Alias!')).toThrow(ValidationError);
  expect(() => new Alias('123@#Invalid')).toThrow(ValidationError);
  expect(() => new Alias('alias com espaço')).toThrow(ValidationError);
  expect(() => new Alias('')).toThrow(ValidationError);
});

test('Deve formatar corretamente um texto em alias válido', () => {
  expect(Alias.format('Alias Com Espaço')).toBe('alias-com-espaco');
  expect(Alias.format('!@#Alias#$%')).toBe('alias');
  expect(Alias.format('Alias---Com----Hífens')).toBe('alias-com-hifens');
  expect(Alias.format('Já tem acento!')).toBe('ja-tem-acento');
});

test('Deve validar corretamente um alias', () => {
  expect(Alias.isValid('valid-alias')).toBe(true);
  expect(Alias.isValid('invalid alias')).toBe(false);
  expect(Alias.isValid('invalid@alias')).toBe(false);
  expect(Alias.isValid('valid123')).toBe(true);
  expect(Alias.isValid('VALID')).toBe(false);
  expect(Alias.isValid('')).toBe(false);
  expect(Alias.isValid(123 as any)).toBe(false);
  expect(Alias.isValid(' leading-space' as any)).toBe(false);
});

test('Deve tentar criar um alias com sucesso', () => {
  const alias = Alias.tryCreate('valid-alias');
  expect(alias.isOk).toBe(true);
});

test('Deve tentar criar um alias inválido', () => {
  const alias = Alias.tryCreate('invalid alias');
  expect(alias.isOk).toBe(false);
  expect(alias.errors[0]?.code).toBe('alias.invalid');
});
