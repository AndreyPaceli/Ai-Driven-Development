# Leituras Obrigatórias

Leia estes arquivos antes de ajustar manualmente qualquer parte da configuração compartilhada do backend NestJS:

1. `packages/shared/src/error/index.ts`
2. `packages/shared/src/error/erro-de-dominio.ts`
3. `packages/shared/src/error/erro-de-validacao.ts`
4. `packages/shared/src/error/erros-de-validacao.ts`
5. `packages/shared/src/dto/usuario-autenticado.dto.ts`
6. `apps/backend/src/app.module.ts`
7. `apps/backend/src/main.ts`
8. `apps/backend/src/shared/modulo-compartilhado.ts`

Alem disso, e obrigatorio localizar e ler a entidade ou classe `Usuario` dentro do modulo de autenticacao do projeto:

- Buscar em `modules/auth/src/` ou `apps/backend/src/modules/auth/` por arquivos como `usuario.entity.ts`, `usuario.ts`, `user.entity.ts` ou equivalente.
- Identificar quais campos a classe `Usuario` expoe (especialmente `id`, nome e email).
- Verificar se a classe ja implementa alguma interface ou contrato de usuario autenticado.
- Essa leitura e obrigatoria para garantir que a interface `IUsuarioAutenticado` definida no `shared/` seja compativel com a classe real do dominio.

Depois dessas leituras base, localizar e ler qualquer arquivo existente do projeto que trate de:

- autenticacao
- JWT
- token
- claims
- usuario logado
- `request.user` ou `req.user`
- guards de autenticacao
- decorators de contexto autenticado
- contexto do request

Busca sugerida:

```bash
rg -n --hidden -S "jwt|token|claims|CurrentUser|currentUser|request.user|req.user|passport|AuthGuard|Bearer|Authorization|authenticated user|user context" apps/backend/src modules packages/shared --glob '!**/node_modules/**'
```

Objetivo das leituras:

- Confirmar como a hierarquia de erros compartilhados funciona e quais status HTTP devem ser respeitados.
- Identificar se o bootstrap atual do backend ja tem filtros globais, pipes, interceptors ou configuracoes correlatas.
- Detectar repeticao de `try/catch` em controllers para convergir tudo para um filtro global.
- Reaproveitar qualquer infraestrutura de autenticacao ja existente antes de criar uma nova.
- Inferir, quando possivel, o shape local de `request.user` e do payload autenticado.
- Mapear os campos reais da classe `Usuario` para garantir que a interface `IUsuarioAutenticado` definida no `shared/` seja compativel e suficiente para uso no guard e no decorator.

Se algum arquivo obrigatorio nao existir no projeto alvo:

- parar para reavaliar a estrutura real
- localizar o arquivo equivalente antes de editar
- registrar a suposicao feita no resultado final da execucao
