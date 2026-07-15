# Especificação: Configuração End-to-End do Projeto Poupig

Criar uma spec (via OpenSpec) para configurar o projeto **de ponta a ponta**, executando os passos abaixo **na ordem apresentada**.

## Passos

1. **Criar o projeto base**
   - Usar a skill `config-project`.
   - Namespace: `@poupig`.

2. **Importar o pacote `shared`**
   - Copiar o arquivo `.docs/prompts/shared.zip`.
   - Descompactar dentro da pasta `packages`.
   - Verificar que o namespace resultante é `@poupig/shared`.

3. **Configurar a camada compartilhada do backend (NestJS)**
   - Usar a skill `config-shared-backend`.
   - Objetivo: habilitar o tratamento centralizado de erros e o código compartilhado entre os módulos.

4. **Configurar o Prisma no backend**
   - Usar a skill `config-prisma`.
   - Garantir que a configuração do Docker e os arquivos `.env` referenciem o projeto `poupig`.
   - **Não executar nenhuma migration** após a configuração.

5. **Configurar a camada compartilhada do frontend (Next.js/React)**
   - Usar a skill `config-shared-frontend`.
   - Objetivo: instalar os componentes comuns no projeto.

## Observações Gerais

- **Sempre que possível, usar as skills** indicadas em cada passo.
- **Executar cada passo em um subagente distinto**, com contexto limpo.
- **Executar os passos de forma sequencial**, respeitando a ordem (cada passo depende da conclusão do anterior).
