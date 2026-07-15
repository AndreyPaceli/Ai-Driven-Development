# Use Case Pattern (Genérico)

## Paths

- Contrato base: `packages/shared/src/base/use-case.ts`
- Use cases (exemplos):
  - `modules/product/src/product/use-case/create-product.use-case.ts`
  - `modules/product/src/product/use-case/update-product.use-case.ts`
  - `modules/auth/src/user/use-case/update-user.use-case.ts`
  - `modules/auth/src/user/use-case/login.use-case.ts`
  - `modules/stock/src/movement/use-case/create-movement-out.use-case.ts`
  - `modules/auth/src/user/use-case/get-auth-dashboard-overview.use-case.ts`
- Testes (exemplos):
  - `modules/branch/test/branch/create-branch.test.ts`
  - `modules/stock/test/movement/create-movement-in.test.ts`
  - `modules/stock/test/snapshot/get-stock-quantity.use-case.test.ts`
  - `modules/product/test/category/category.use-case.test.ts`

## Estrutura esperada

1. Definir `XxxIn` (e `XxxOut` quando necessário).
2. Declarar classe `XxxUseCase implements UseCase<XxxIn, XxxOut>`.
3. Injetar dependências via construtor (`Repository`, `Query`, `Checker`, `Provider`).
4. Implementar `execute(data)` retornando `Promise<Result<...>>`.
5. Aplicar validações de fluxo com retorno antecipado em falha.
6. Delegar invariantes de domínio para entidade/VO (`tryCreate`, `cloneWith`).
7. Retornar resultado de provider/repo ou `Result.ok(...)` com DTO/agregado final.

## Padrões observados no código

- Use case orquestra, não persiste diretamente.
- Erros conhecidos são mapeados para constantes de domínio (`...Errors.NOT_FOUND`, etc.).
- Dependência pode ser `Query` ou `Repository` conforme objetivo do caso:
  - Leitura/projeção: preferir `Query` retornando DTO.
  - Comando/escrita: preferir `Repository` e entidade de domínio.
- Combinação de providers é comum:
  - Exemplo: busca em query + agregação de dados (`GetAuthDashboardOverviewUseCase`).
  - Exemplo: valida existência e cria dependência se necessário (`CreateMovementIn`).
- Em update:
  - Carregar estado atual (`findById`).
  - Montar novo estado com fallback de campos atuais.
  - Revalidar com entidade (`tryCreate`/`cloneWith`) antes de persistir.

## Checklist de implementação

- Contrato:
  - `UseCase<IN, OUT>` implementado corretamente.
  - `execute` com assinatura assíncrona e retorno `Result`.
- Dependências:
  - Tipadas por interfaces (não acoplar em infraestrutura concreta).
  - Injetadas no construtor.
- Erros:
  - Tratar falha de cada dependência de forma explícita.
  - Propagar `withFail` quando já estiver no formato esperado.
- Domínio:
  - Criar/atualizar entidades com `tryCreate` ou `cloneWith`.
  - Evitar colocar regra de entidade dentro do use case.
- Persistência/leitura:
  - Usar `repo/query` apenas para acesso a dados.
  - Em leitura para API/front, priorizar `Query` com DTO de saída.
  - Em escrita, ler com `Repository` quando necessário para preservar invariantes e salvar entidade.

## Estratégia de testes

- Cenário feliz completo.
- Pré-condições inválidas (quantidade <= 0, input ausente, etc.).
- Falhas de dependência (repo/query retornando `isFailure`).
- Comportamento condicional (com snapshot/sem snapshot, item existente/inexistente).
- Efeito colateral esperado (criação em repositório mock, update chamado com entidade válida).

## Armadilhas comuns

- Misturar lógica de validação de entidade no use case sem reutilizar `tryCreate`.
- Não mapear falhas de dependências para erro de domínio quando necessário.
- Atualizar parcialmente sem preservar `props` existentes.
- Retornar exceção em vez de `Result.fail` dentro do fluxo normal.

## Exemplo mínimo

```ts
import { Result, UseCase } from '@namespace/shared';
import { Thing } from '../model/thing.entity';
import { ThingRepository } from '../provider/thing.repository';

export interface CreateThingIn {
  name: string;
}

export class CreateThingUseCase implements UseCase<CreateThingIn, void> {
  constructor(private readonly repo: ThingRepository) {}

  async execute(data: CreateThingIn): Promise<Result<void>> {
    return Result.try(async () => {
      const thingResult = Thing.tryCreate({ name: data.name }).validator.throwsIfFailed().result.instance;

      const tryCreateThing = await this.repo.create(thingResult);
      tryCreateThing.validator.throwsIfFailed();
    });
  }
}
```

## Exemplo completo com consulta (query) para criar um usuário

```ts
import { Password, PasswordCryptoProvider, PasswordRepository } from 'fake/path';
import { Currency, DEFAULT_CURRENCY, Result, TransactionManager, UseCase } from '@poupig/shared';
import { User, UserErrors, UserRepository } from 'fake/path';
import { UserExistsQuery } from 'fake/path';

export interface CreateUserIn {
  name: string;
  email: string;
  avatarUrl?: string;
  currency?: string;
  password: string;
}

export class CreateUserUseCase implements UseCase<CreateUserIn, void> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly passRepo: PasswordRepository,
    private readonly userExistsQuery: UserExistsQuery,
    private readonly passwordCryptoProvider: PasswordCryptoProvider,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(data: CreateUserIn): Promise<Result<void>> {
    return Result.try(async () => {
      const tryUserExists = await this.userExistsQuery.execute({
        email: data.email,
      });
      tryUserExists.validator.throwsIfFailed().throwsIfTrue(UserErrors.EMAIL_ALREADY_EXISTS);

      const tryHashedPassword = await this.passwordCryptoProvider.hash(data.password);
      const password = Password.create({ content: tryHashedPassword });
      const tryCurrency = Currency.tryCreate(normalizedCode, {
        attribute: 'currency',
      }).validator.throwsIfFailed().result;

      tryCurrency.validator.throwsIfFailed();

      const user = User.tryCreate({
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl?.trim() || undefined,
        currency: tryCurrency.instance,
      }).validator.throwsIfFailed().result.instance;

      await this.transactionManager.runInTransaction(async (tx) => {
        const tryCreateUser = await this.userRepo.create(user, tx);
        tryCreateUser.validator.throwsIfFailed();

        const tryCreatePass = await this.passRepo.create(password, user.id, tx);
        tryCreatePass.validator.throwsIfFailed();
      });
    });
  }
}
```
