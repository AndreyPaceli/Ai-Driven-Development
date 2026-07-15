import { EncryptedPassword, ValidationError } from '../../src';

const VALID_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
const INVALID_HASH = 'not-a-bcrypt-hash';

test('Deve aceitar um hash bcrypt válido', () => {
  const ep = new EncryptedPassword(VALID_HASH);
  expect(ep.value).toBe(VALID_HASH);
});

test('Deve lançar ValidationError para hash inválido', () => {
  expect(() => new EncryptedPassword(INVALID_HASH)).toThrow(ValidationError);
});

test('Deve lançar ValidationError quando value é undefined', () => {
  expect(() => new EncryptedPassword(undefined)).toThrow(ValidationError);
});

test('Deve validar hash bcrypt via isValid', () => {
  expect(EncryptedPassword.isValid(VALID_HASH)).toBe(true);
  expect(EncryptedPassword.isValid(INVALID_HASH)).toBe(false);
});

test('Deve criar via create com hash válido', () => {
  const ep = EncryptedPassword.create(VALID_HASH);
  expect(ep.value).toBe(VALID_HASH);
});

test('Deve lançar via create com hash inválido', () => {
  expect(() => EncryptedPassword.create(INVALID_HASH)).toThrow();
});

test('Deve retornar resultado ok via tryCreate com hash válido', () => {
  const result = EncryptedPassword.tryCreate(VALID_HASH);
  expect(result.isOk).toBe(true);
  expect(result.instance.value).toBe(VALID_HASH);
});

test('Deve retornar resultado de falha via tryCreate com hash inválido', () => {
  const result = EncryptedPassword.tryCreate(INVALID_HASH);
  expect(result.isOk).toBe(false);
  expect(result.errors[0]?.code).toBe('encrypted-password.invalid');
});
