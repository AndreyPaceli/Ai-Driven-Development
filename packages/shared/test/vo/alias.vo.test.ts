import { Alias, Result } from '../../src';

describe('Alias', () => {
  describe('format', () => {
    test('should return empty string when input is not a string', () => {
      const result = Alias.format(123 as unknown as string);

      expect(result).toBe('');
    });

    test('should normalize text with uppercase, accents and spaces to alias format', () => {
      const result = Alias.format('  Café   da\tManhã 2026  ');

      expect(result).toBe('cafe-da-manha-2026');
    });

    test('should keep value unchanged when already in valid alias format', () => {
      const result = Alias.format('categoria-123');

      expect(result).toBe('categoria-123');
    });

    test('should collapse consecutive separators into a single hyphen and trim edges', () => {
      const result = Alias.format('---Minha___Categoria@@@Teste---');

      expect(result).toBe('minha-categoria-teste');
    });

    test('should remove leading and trailing hyphens after normalization', () => {
      const result = Alias.format('   -- Minha categoria --   ');

      expect(result).toBe('minha-categoria');
    });

    test('should keep a single trailing hyphen when typing mode is enabled and input ends with separator', () => {
      const result = Alias.format('   -- Minha categoria --   ', true);

      expect(result).toBe('minha-categoria-');
    });

    test('should not append trailing hyphen in typing mode when input ends with letter or number', () => {
      const result = Alias.format('Minha categoria 123', true);

      expect(result).toBe('minha-categoria-123');
    });

    test('should return empty string when input has no letters or numbers', () => {
      const result = Alias.format('   ---   ');

      expect(result).toBe('');
    });
  });

  test('should create with valid alias', () => {
    const result = Alias.tryCreate('product-123');

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('product-123');
  });

  test('should normalize uppercase letters to lowercase', () => {
    const result = Alias.tryCreate('PRODuct-123');

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('product-123');
  });

  test('should create with create when alias is valid', () => {
    const alias = Alias.create('Produto-123');

    expect(alias.value).toBe('produto-123');
  });

  test('should accept alias without hyphen when valid', () => {
    const result = Alias.tryCreate('abc123');

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('abc123');
  });

  test('should fail when alias is not a string', () => {
    const result = Alias.tryCreate(123 as unknown as string);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_ALIAS');
  });

  test('should fail when alias has space in the middle', () => {
    const result = Alias.tryCreate('abc 123');

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_ALIAS');
  });

  test('should fail when alias has leading or trailing spaces', () => {
    const leading = Alias.tryCreate(' abc123');
    const trailing = Alias.tryCreate('abc123 ');

    expect(leading.isFailure).toBe(true);
    expect(leading.errors).toContain('INVALID_ALIAS');
    expect(trailing.isFailure).toBe(true);
    expect(trailing.errors).toContain('INVALID_ALIAS');
  });

  test('should fail when alias has consecutive hyphens', () => {
    const result = Alias.tryCreate('abc--123');

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_ALIAS');
  });

  test('should fail when alias ends with hyphen', () => {
    const result = Alias.tryCreate('abc-123-');

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_ALIAS');
  });

  test('should accept alias with only letters or only numbers', () => {
    const onlyLetters = Alias.tryCreate('abcdef');
    const onlyNumbers = Alias.tryCreate('123456');

    expect(onlyLetters.isOk).toBe(true);
    expect(onlyLetters.instance.value).toBe('abcdef');
    expect(onlyNumbers.isOk).toBe(true);
    expect(onlyNumbers.instance.value).toBe('123456');
  });

  test('should fail with invalid characters', () => {
    const result = Alias.tryCreate('abc_123');

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_ALIAS');
  });

  test('should fail when alias starts with hyphen', () => {
    const result = Alias.tryCreate('-abc123');

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_ALIAS');
  });

  test('should fail when alias is composed only by hyphens', () => {
    const result = Alias.tryCreate('---');

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_ALIAS');
  });

  test('should throw when using create with invalid alias', () => {
    expect(() => Alias.create('abc--123')).toThrow();
  });

  test('should fallback to default error when an unknown error is thrown', () => {
    const resultOkSpy = jest.spyOn(Result, 'ok').mockImplementation(() => {
      throw {};
    });

    try {
      const result = Alias.tryCreate('abc123');

      expect(result.isFailure).toBe(true);
      expect(result.errors).toContain('INVALID_ALIAS');
    } finally {
      resultOkSpy.mockRestore();
    }
  });
});
