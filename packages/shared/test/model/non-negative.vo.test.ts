import { NonNegative, ValidationError } from '../../src';

test('Deve criar um NonNegative com valores válidos', () => {
  expect(new NonNegative(0).value).toBe(0);
  expect(new NonNegative(10).value).toBe(10);
  expect(new NonNegative(999.99).value).toBe(999.99);
});

test('Deve lançar ValidationError para números negativos', () => {
  expect(() => new NonNegative(-1)).toThrow(ValidationError);
  expect(() => new NonNegative(-100)).toThrow(ValidationError);
  expect(() => new NonNegative(-0.01)).toThrow(ValidationError);
});

test('Deve tentar criar um número não negativo com sucesso', () => {
  const nonNegative = NonNegative.tryCreate(10);
  expect(nonNegative.isOk).toBe(true);
});

test('Deve tentar criar um número não negativo inválido', () => {
  const nonNegative = NonNegative.tryCreate(-10);
  expect(nonNegative.isOk).toBe(false);
  expect(nonNegative.errors[0]?.code).toBe('non-negative.invalid');
});

test('Deve criar um número não negativo válido via create', () => {
  const nonNegative = NonNegative.create(0);
  expect(nonNegative.value).toBe(0);
});

test('Deve lançar ao criar um número negativo via create', () => {
  expect(() => NonNegative.create(-1)).toThrow();
});
