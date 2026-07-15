import { Duration, ValidationError } from '../../src';

test('Deve criar uma duração a partir de segundos', () => {
  const duration = Duration.inSeconds(123);
  expect(duration.inSeconds).toBe(123);
});

test('Deve criar uma duração a partir de dias, horas, minutos e segundos', () => {
  const duration = Duration.from({ d: 1, h: 2, m: 3, s: 4 });
  expect(duration.inSeconds).toBe(93784);
});

test('Deve criar duração de um dia', () => {
  const duration = Duration.from({ d: 1 });
  expect(duration.inDays).toBe(1);
  expect(duration.inHours).toBe(24);
  expect(duration.inMinutes).toBe(1440);
  expect(duration.inSeconds).toBe(86400);
});

test('Deve criar duração de 30 segundos', () => {
  const duration = Duration.from({ s: 30 });
  expect(duration.inDays).toBe(0);
  expect(duration.inHours).toBe(0);
  expect(duration.inMinutes).toBe(0);
  expect(duration.inSeconds).toBe(30);
  expect(duration.toHMS).toBe('00h 00m 30s');
});

test('Deve criar duração zerada', () => {
  const duration = Duration.zero();
  expect(duration.inSeconds).toBe(0);
});

test('Deve converter duração para dias, horas, minutos e segundos', () => {
  const duration = Duration.from({ d: 1, h: 2, m: 3, s: 4 });
  expect(duration.inDays).toBe(1);
  expect(duration.inHours).toBe(26);
  expect(duration.inMinutes).toBe(1563);
});

test('Deve formatar duração para HH:mm:ss', () => {
  const duration = Duration.from({ d: 1, h: 2, m: 3, s: 4 });
  expect(duration.toHMS).toBe('26h 03m 04s');
});

test('Deve formatar duração para HH:mm', () => {
  const duration = Duration.from({ d: 1, h: 2, m: 3, s: 4 });
  expect(duration.toHM).toBe('26h 03m');
});

test('Deve formatar duração para HH:mm', () => {
  const duration = Duration.from({ d: 1, h: 2, m: 3, s: 4 });
  expect(duration.toMS).toBe('1563m 04s');
});

test('Deve somar duas durações', () => {
  const duration1 = Duration.from({ d: 1, h: 2, m: 3, s: 4 });
  const duration2 = Duration.from({ d: 0, h: 1, m: 2, s: 3 });
  const duration3 = duration1.add(duration2);
  expect(duration3.inSeconds).toBe(97507);
});

test('Deve lançar erro ao tentar criar uma duração negativa', () => {
  expect(() => Duration.inSeconds(-10)).toThrow('duration.negative');
});

test('Deve obter horas e minutos de uma duração', () => {
  const duration = Duration.from({ d: 1, h: 2, m: 3, s: 4 });
  expect(duration.hoursAndMinutes).toEqual({ hours: '26', minutes: '03' });
});

test('Deve tentar criar uma duração com sucesso', () => {
  const duration = Duration.tryCreate(10000);
  expect(duration.isOk).toBe(true);
});

test('Deve tentar criar uma duração inválida', () => {
  const duration = Duration.tryCreate(-10000);
  expect(duration.isOk).toBe(false);
  expect(duration.errors[0]?.code).toBe('duration.negative');
});

test('Deve criar uma duração válida via create', () => {
  const duration = Duration.create(60);
  expect(duration.inSeconds).toBe(60);
});

test('Deve lançar ao criar uma duração negativa via create', () => {
  expect(() => Duration.create(-1)).toThrow();
});
