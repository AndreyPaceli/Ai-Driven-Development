import { PersonName, ValidationError } from '../../src';

test('Deve lançar erro ao tentar criar nome vazio', () => {
  expect(() => new PersonName()).toThrow('');
  expect(() => new PersonName('')).toThrow('');
});

test('Deve lançar vários erros ao tentar criar nome vazio', () => {
  expect(() => new PersonName()).toThrow('');
});

test('Deve lançar erro ao tentar criar nome menor que 3 caracteres', () => {
  expect(() => new PersonName('L Z')).toThrow('');
});

test('Deve lançar erro ao tentar criar nome maior que 120 caracteres', () => {
  const bigName =
    'Pedro de Alcântara João Carlos Leopoldo Salvador Bibiano Francisco Xavier de Paula Leocádio Miguel Gabriel Rafael Gonzaga de Bragança e Habsburgo';
  expect(() => new PersonName(bigName)).toThrow('');
});

test('Deve lançar erro ao tentar criar nome sem sobrenome', () => {
  expect(() => new PersonName('Guilherme')).toThrow('');
});

test('Deve lançar erro ao tentar criar nome com caracteres especiais', () => {
  expect(() => new PersonName('João @OOOJoao')).toThrow('');
});

test('Deve criar nome e dois sobrenomes', () => {
  const name = new PersonName('João Silva Pereira');
  expect(name.value).toBe('João Silva Pereira');
  expect(name.firstName).toBe('João');
  expect(name.lastNames).toEqual(['Silva', 'Pereira']);
  expect(name.lastName).toBe('Pereira');
});

test('Deve criar nome com apostrofo', () => {
  const nameExample = "João D'Ávila";
  const name = new PersonName(nameExample);
  expect(name.value).toBe(nameExample);
});

test('Deve retornar as iniciais do nome', () => {
  const name = new PersonName('João Silva Pereira');
  expect(name.initials).toBe('JP');
});

test('Deve tentar criar um nome com sucesso', () => {
  const name = PersonName.tryCreate('João Silva Pereira');
  expect(name.isOk).toBe(true);
});

test('Deve tentar criar um nome inválido', () => {
  const name = PersonName.tryCreate('João');
  expect(name.isOk).toBe(false);
  expect(name.errors[0]?.code).toBe('person-name.surname-missing');
});
