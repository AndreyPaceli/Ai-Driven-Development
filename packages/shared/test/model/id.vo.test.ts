import { Id } from '../../src';

test('Deve criar um novo id válido', () => {
  const id = Id.createUUID();
  expect(id).toHaveLength(36);
});

test('Deve lançar erro ao tentar criar um id inválido', () => {
  expect(() => new Id('123')).toThrow('id.invalid');
});

test('Deve criar um novo id válido a partir de um id existente', () => {
  const valor = Id.createUUID();
  const id = new Id(valor);
  expect(id.value).toHaveLength(36);
});

test('Deve testar verdadeiro para ids iguais', () => {
  const id1 = Id.create();
  const id2 = new Id(id1.value);
  expect(id1.equals(id2)).toBe(true);
  expect(id1.notEquals(id2)).toBe(false);
});

test('Deve testar falso para ids diferentes', () => {
  const id1 = Id.create();
  const id2 = Id.create();
  expect(id1.equals(id2)).toBe(false);
  expect(id1.notEquals(id2)).toBe(true);
});

test('Deve tentar criar um id com sucesso', () => {
  const id = Id.tryCreate('70a3a0ad-1eaf-4b66-8555-10b374b949bd');
  expect(id.isOk).toBe(true);
});

test('Deve tentar criar um id inválido', () => {
  const id = Id.tryCreate('invalid-id');
  expect(id.isOk).toBe(false);
  expect(id.errors[0]?.code).toBe('id.invalid');
});
