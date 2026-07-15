# @arquitetura/shared

Biblioteca de infraestrutura compartilhada para projetos com arquitetura orientada ao domínio. Fornece os blocos de construção do DDD — `Result`, `Entity`, `ValueObject`, `UseCase` — além de contratos de repositório, sistema de erros estruturados e uma biblioteca de Value Objects prontos para uso.

---

## Padrão Result

O núcleo da biblioteca. Torna sucesso e falha parte da assinatura de retorno das funções, eliminando exceções no fluxo de domínio.

```typescript
// Fábricas estáticas
Result.ok(value); // sucesso com valor
Result.ok(); // sucesso sem valor (void)
Result.empty<T>(); // sucesso com instance null
Result.fail('ERR_CODE'); // falha com um erro
Result.fail(['E1', 'E2']); // falha com múltiplos erros

// Captura automática de exceções
Result.try(() => new MeuVO(value)); // síncrono
await Result.tryAsync(() => repositorio.findById(id)); // assíncrono

// Combina múltiplos Results — agrega todos os erros se algum falhar
Result.combine([r1, r2, r3] as const);
await Result.combineAsync([promise1, promise2]);
```

### `ResultValidator` — guard clauses fluentes

```typescript
result.validator
  .throwsIfFailed() // lança se result.isFailure
  .throwsIfNull('ERR') // lança se instance == null
  .throwsIfTrue('ERR').result; // lança se instance === true // devolve o Result original
```

Todos os métodos aceitam um segundo parâmetro `exceptionFactory` para substituir o `ResultError` padrão por qualquer tipo de exceção.

### Extensões em `String.prototype`

O módulo `Result` adiciona três propriedades ao tipo primitivo `string`:

| Extensão         | Comportamento                                                                           |
| ---------------- | --------------------------------------------------------------------------------------- |
| `.code`          | Mapeia constantes de erro para códigos semânticos (`INVALID_EMAIL` → `'email.invalid'`) |
| `.value`         | Retorna `this.toString()` — compatibilidade com a interface de VOs                      |
| `.equals(other)` | Compara com string ou com `{ value: string }`                                           |

---

## Blocos de construção do domínio

### `Entity<Type, Props>`

Classe abstrata para objetos com identidade persistente (ID UUID). Inicializa automaticamente `id`, `createdAt`, `updatedAt` e `deletedAt` quando não fornecidos.

**Clonagem com rastreamento de diff:**

```typescript
// Retorna as novas props e um diff tipado do que mudou
const { props, diff } = entity.cloneProps({ name: 'novo' });
// diff = { name: { previous: 'antigo', current: 'novo' } }

// Cria nova instância a partir dos overrides, retornando Result
const result = entity.clone({ status: 'active' });
```

`clone` chama `tryCreate` da subclasse se disponível, respeitando as invariantes da entidade.

### `ValueObject<T, Config>`

Objetos imutáveis identificados pelo valor, não por referência. `equals` compara `value`; `config` carrega metadados de contexto.

### `UseCase<IN, OUT>`

Contrato padrão da camada de aplicação:

```typescript
class CriarUsuario implements UseCase<CriarUsuarioDto, Usuario> {
  async execute(dto: CriarUsuarioDto): Promise<Result<Usuario>> { ... }
}
```

---

## Sistema de erros estruturados

### `Metadata`

Contexto imutável e fluente para enriquecer erros de validação.

```typescript
const meta = new Metadata({ module: 'auth', object: 'user' });
const emailMeta = meta.to('email', 'valor-invalido');
// { module: 'auth', object: 'user', attribute: 'email', value: 'valor-invalido' }
```

Campos: `module`, `object`, `attribute`, `value`, `id`. Métodos: `withModule/Object/Attribute/Value/Id`, `to(attribute, value?)`.

### `ValidationError`

Exceção que carrega `Message[]` (código + metadados) e status HTTP. Usada pelos VOs que precisam de contexto rico.

```typescript
throw new ValidationError({ code: 'cpf.invalid', meta: meta.props }, 422);
```

### `ResultError`

Exceção simples com `errors: string[]`. Usada pela `ResultValidator` como padrão quando não há `exceptionFactory`.

---

## Padrão `create` / `tryCreate`

Todos os VOs e entidades seguem este contrato:

| Método           | Retorno     | Ao falhar                              |
| ---------------- | ----------- | -------------------------------------- |
| `tryCreate(...)` | `Result<T>` | Retorna `Result.fail` — nunca lança    |
| `create(...)`    | `T`         | Lança via `validator.throwsIfFailed()` |

---

## Value Objects

### Identidade e texto

| VO                 | Regras principais                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `Id`               | UUID v4; auto-gera quando omitido; `createUUID()` gera string avulsa                                       |
| `Email`            | Normaliza trim + lowercase; expõe `local`, `domain`, `username`                                            |
| `Alias`            | Slug `[a-z0-9]+(-[a-z0-9]+)*`; método estático `format(value)` converte texto livre                        |
| `PersonName`       | 3–50 chars; primeiro e último nome obrigatórios (≥2 chars cada); expõe `firstName`, `lastName`, `initials` |
| `Text`             | String com `minLength`/`maxLength` configuráveis via `TextConfig`                                          |
| `ShortDescription` | Estende `Text`; padrão 15–80 chars                                                                         |
| `Description`      | Estende `Text`; padrão 20–2000 chars                                                                       |

### Senhas

| VO                  | Propósito                                                                        |
| ------------------- | -------------------------------------------------------------------------------- |
| `Password`          | Senha plana não-vazia (sem regras de força)                                      |
| `StrongPassword`    | Mín. 8 chars, maiúscula, minúscula, número, caractere especial                   |
| `HashPassword`      | Hash bcrypt validado por regex (`$2[aby]$...`)                                   |
| `EncryptedPassword` | Mesmo formato que `HashPassword`; nome semântico para contextos de armazenamento |

### Números e datas

| VO                | Regras                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PositiveInteger` | Inteiro finito ≥ 1                                                                                                                                            |
| `NonNegative`     | Número ≥ 0                                                                                                                                                    |
| `DayOfMonth`      | Inteiro 1–31                                                                                                                                                  |
| `DateOnly`        | Data sem hora; aceita `string` ou `Date`; normaliza para `YYYY-MM-DD`; expõe `asDate`                                                                         |
| `Duration`        | Tempo em segundos; fábricas `from({ d, h, m, s })`, `inSeconds(n)`, `zero()`; getters `inMinutes/Hours/Days`, `toHMS`, `toHM`, `toMS`; método `add(duration)` |

### Outros

| VO         | Regras                                                                              |
| ---------- | ----------------------------------------------------------------------------------- |
| `HexColor` | Formatos `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`; normaliza para maiúsculas com `#` |
| `Cpf`      | Validação aritmética dos dígitos verificadores; expõe `formatted` e `unformatted`   |
| `Url`      | HTTP/HTTPS; expõe `domain`, `protocol`, `pathname`, `parameters`                    |

---

## Contratos de repositório

```typescript
interface CreateRepository<T> {
  create(entity: T, tx?): Promise<Result<void>>;
}
interface UpdateRepository<T> {
  update(entity: T, tx?): Promise<Result<void>>;
}
interface FindByIdRepository<T> {
  findById(id: string): Promise<Result<T>>;
}
interface DeleteRepository {
  delete(id: string, tx?): Promise<Result<void>>;
}

// Compõe todos os quatro
interface CrudRepository<T extends Entity<any, any>>
  extends CreateRepository<T>, UpdateRepository<T>, FindByIdRepository<T>, DeleteRepository {}
```

`TransactionManager<CTX>` abstrai transações: `runInTransaction(fn)` injeta um `TransactionContext` na operação sem expor o ORM.

---

## DTOs de paginação

```typescript
interface PaginatedInputDTO {
  page: number;
  pageSize: number;
}
interface PaginationMetaDTO {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
interface PaginatedResultDTO<T> {
  data: T[];
  meta: PaginationMetaDTO;
}
```

---

## Scripts

```bash
npm run build        # Compila para dist/
npm run dev          # Watch mode
npm test             # Testes com cobertura
npm run test:watch   # Watch mode para testes
```

## Dependências

| Pacote | Uso                        |
| ------ | -------------------------- |
| `uuid` | Geração de UUID v4 em `Id` |
