import { HexColor } from '../../src';

const error = 'hexcolor.invalid';

test('Deve criar um cor em hexadecimal', () => {
  const cor = new HexColor('#ff0000');
  expect(cor.value).toBe('#ff0000');
});

test('Deve validar cor em hexadecimal', () => {
  expect(HexColor.isValid('#ff0000')).toBe(true);
  expect(HexColor.isValid('#f00')).toBe(true);
  expect(HexColor.isValid('#FF0000')).toBe(true);
  expect(HexColor.isValid('#F00')).toBe(true);

  expect(HexColor.isValid(null as any)).toBe(false);
  expect(HexColor.isValid('     ')).toBe(false);
  expect(HexColor.isValid('JJJ')).toBe(false);
  expect(HexColor.isValid('111')).toBe(false);
  expect(HexColor.isValid('#ff000')).toBe(false);
});

test('Deve lançar erro ao tentar criar cor inválida', () => {
  expect(() => new HexColor(null as any)).toThrow(error);
  expect(() => new HexColor('   ')).toThrow(error);
  expect(() => new HexColor('JJJ')).toThrow(error);
  expect(() => new HexColor('111')).toThrow(error);
  expect(() => new HexColor('#ff000')).toThrow(error);
});

test('Deve tentar criar uma cor com sucesso', () => {
  const cor = HexColor.tryCreate('#ff0000');
  expect(cor.isOk).toBe(true);
});

test('Deve tentar criar uma cor inválida', () => {
  const cor = HexColor.tryCreate('#ff000');
  expect(cor.isOk).toBe(false);
  expect(cor.errors[0]?.code).toBe(error);
});
