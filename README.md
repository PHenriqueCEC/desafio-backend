# 🏋️ Gympass API

API para gerenciamento de usuários, academias e check-ins, desenvolvida com **Fastify**, **Prisma** e **PostgreSQL**.

---

## 📋 Pré-requisitos

Antes de começar, tenha estas ferramentas instaladas:

- [Node.js](https://nodejs.org/)
- npm (instalado junto com o Node.js)
- [Docker](https://www.docker.com/) com Docker Compose

---

## 🚀 Configuração e execução

1. **Instale as dependências:**

   ```bash
   npm i
   ```

   > ⚠️ Se o npm reportar vulnerabilidades ao final da instalação, rode:
   >
   > ```bash
   > npm audit fix --force
   > ```

2. **Crie o arquivo `.env`** a partir de `.env.example` e informe um valor seguro para `JWT_SECRET`. A `DATABASE_URL` deve apontar para o PostgreSQL do Docker. Com a configuração atual de `docker-compose.yml`, use a porta `5432` e o banco `apidesafio`:

   ```env
   NODE_ENV=dev
   JWT_SECRET=uma-chave-segura
   PORT=3333
   DATABASE_URL="postgresql://docker:docker@localhost:5432/apidesafio?schema=public"
   ```

3. **Inicie o PostgreSQL:**

   ```bash
   docker compose up
   ```

   Para executar em segundo plano, use `docker compose up -d`.

4. **Crie/aplique as migrations e gere o cliente Prisma:**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

   > ℹ️ Esse passo não é obrigatório para subir a API — veja a seção [Comandos Prisma](#-comandos-prisma) para entender o que cada comando faz e quando ele é realmente necessário.

5. **Inicie a API:**

   ```bash
   npm run start:dev
   ```

   O servidor estará disponível em `http://localhost:3333`.

---

## 🔧 Comandos Prisma

| Comando | Para que serve | É essencial? |
| --- | --- | --- |
| `npx prisma migrate dev` | Compara o `prisma/schema.prisma` com o banco, gera os arquivos SQL de migration e os aplica no banco de desenvolvimento, criando/atualizando as tabelas. | Só é necessário na primeira vez que o banco é criado ou depois de alterar models, enums ou relações no schema. |
| `npx prisma generate` | Lê o `prisma/schema.prisma` e gera o Prisma Client (código TypeScript tipado) usado pela aplicação para acessar o banco. | Só é necessário depois de alterar o schema ou se o Prisma Client ainda não foi gerado no projeto (ex.: logo após clonar o repositório). |
| `npx prisma studio` | Abre uma interface visual, normalmente em `http://localhost:5555`, para consultar e editar os dados do banco. | Opcional — útil para desenvolvimento e inspeção dos registros. |

> 💡 Em resumo: se o banco já existe e o Prisma Client já foi gerado, você pode pular esses comandos e ir direto para `npm run start:dev`.

---

## 📖 Documentação e testes das rotas

Você pode testar a API de duas formas:

### Opção 1 — Postman

Uma collection do Postman está disponível em anexo neste repositório, já com os endpoints organizados e prontos para importar.

### Opção 2 — Swagger

Com a API em execução, abra a documentação interativa em:

```text
http://localhost:3333/docs
```

O Swagger lista as rotas de autenticação, usuários, academias e check-ins. Em cada operação é possível ver os parâmetros, o body esperado, exemplos de resposta e os status HTTP — ótimo tanto para testar as rotas quanto para consultar a documentação de cada endpoint.

**Para testar uma rota protegida pelo Swagger:**

1. Crie o usuário em `POST /users`.
2. Faça login em `POST /sessions` com e-mail e senha. A resposta devolve um JWT no campo `token`.
3. Clique em **Authorize** no topo da página do Swagger.
4. Cole o token no campo `bearerAuth`. O Swagger adiciona o prefixo `Bearer` automaticamente.
5. Execute a rota desejada, como `GET /me` ou `DELETE /users`.

Exemplo do body de autenticação (`POST /sessions`):

```json
{
  "email": "pedro9admin@gmail.com",
  "password": "123456"
}
```

---

## 👤 Papéis de usuário

Todo usuário criado em `POST /users` recebe automaticamente o papel `MEMBER`. Usuários `MEMBER` podem pesquisar academias e fazer check-ins, mas não podem criar academias nem validar check-ins.

As rotas abaixo exigem o papel `ADMIN`:

- `POST /gyms` — criar academia;
- `PATCH /check-ins/:checkInId/validate` — validar check-in.

Para testar essas rotas durante o desenvolvimento, abra o Prisma Studio:

```bash
npx prisma studio
```

Na tabela `User`, localize o usuário e altere o campo `role` de `MEMBER` para `ADMIN`. Depois faça login novamente em `POST /sessions`, pois o papel é incluído no JWT emitido no login. Use o novo token no Swagger.

---

## ❓ Por que `PATCH` em vez de `PUT`?

`PATCH` é usado quando somente parte de um recurso é alterada. Por exemplo, `PATCH /users` atualiza a senha do usuário autenticado sem exigir que nome, e-mail e outros campos sejam enviados novamente.

Já `PUT` normalmente comunica a substituição completa de um recurso. Ele seria mais adequado se o cliente tivesse que mandar a representação inteira do usuário para substituir seu estado atual. Como a API atualiza apenas campos específicos, `PATCH` expressa melhor a intenção.

---

## 🧪 Testes

Os testes são escritos com **Vitest** e divididos em dois níveis:

| Tipo | Local | O que valida | Comando |
| --- | --- | --- | --- |
| Unitários | `src/use-cases` | Regras de negócio isoladas, como limite de um check-in por dia, distância máxima até a academia e validação de senha. | `npm test` |
| E2E | `src/http/controllers` | Fluxo completo das rotas HTTP, incluindo autenticação, status HTTP, middleware e integração com banco de testes. | `npm run test:e2e` |

Para acompanhar testes unitários durante o desenvolvimento, use:

```bash
npm run test:watch
```

Os testes unitários não dependem de PostgreSQL. Já os testes E2E usam o ambiente Prisma configurado em `prisma/vitest-environment-prisma`. A cada execução ele cria um schema PostgreSQL temporário, aplica as migrations nesse schema e o remove ao final. Assim, os testes não alteram os dados de desenvolvimento; apenas o PostgreSQL do Docker precisa estar em execução.

---

## 🏗️ Arquitetura e padrões adotados

O projeto separa as responsabilidades em camadas para manter as regras de negócio independentes de HTTP e do banco de dados:

```text
Controllers (HTTP) → Use cases (regras de negócio) → Repositories (acesso aos dados)
                                                    ↳ Prisma / In memory
```

### Controllers

Estão em `src/http/controllers`. Eles recebem a requisição, validam os dados de entrada com Zod, chamam o caso de uso apropriado e devolvem a resposta HTTP. Controllers não devem concentrar regras de negócio ou consultas diretas ao banco.

> ✅ **Vantagem:** mantém a camada HTTP "burra" e substituível. Como o controller só recebe requisição, valida e delega ao use case, é possível trocar o framework (Fastify por Express, por exemplo) sem tocar em nenhuma regra de negócio — só reescrevendo essa fina camada de entrada/saída.

### Use cases

Estão em `src/use-cases`. Cada caso de uso representa uma ação da aplicação — por exemplo, cadastrar usuário, autenticar, criar academia, fazer ou validar check-in. É nessa camada que ficam as regras de negócio e os erros específicos do domínio.

> ✅ **Vantagem:** centraliza a regra de negócio em um único lugar, testável isoladamente e sem depender de HTTP nem de banco real. Isso facilita reaproveitar a mesma lógica em outros contextos (uma CLI, um job agendado, um worker) e deixa o código autoexplicativo: o nome do arquivo já diz o que a aplicação faz (`register-user`, `check-in`, `validate-check-in` etc.), funcionando quase como documentação viva.

### Erros de domínio

A pasta `src/use-cases/errors` reúne classes de erro que representam situações esperadas pelas regras de negócio, como `UserAlreadyExistsError`, `InvalidCredentialsError`, `ResourceNotFoundError`, `MaxDistanceError` e `MaxNumberOfCheckInsError`.

Em vez de lançar erros genéricos ou devolver respostas HTTP dentro do caso de uso, a regra lança um erro com significado de domínio. O controller identifica esse tipo de erro e o converte na resposta HTTP adequada, por exemplo `409` para e-mail já cadastrado, `400` para credenciais inválidas ou `404` para um recurso não encontrado.

Vantagens dessa abordagem:

- Mantém os casos de uso independentes de Fastify e HTTP, permitindo reutilizá-los em uma CLI, fila ou GraphQL;
- Deixa as regras mais legíveis, pois cada situação possui um nome específico;
- Facilita testes unitários, que verificam exatamente qual regra falhou sem depender de status HTTP;
- Centraliza mensagens e evita comparar textos de erro para decidir o fluxo da aplicação.

### Repositories

Estão em `src/repositories`. Um repositório define um contrato para ler e gravar dados, como buscar usuário por e-mail ou criar um check-in. A implementação de produção usa o Prisma em `src/repositories/prisma`, que conversa com o PostgreSQL.

> ✅ **Vantagem:** desacopla a regra de negócio da tecnologia de persistência. O use case não sabe se os dados vêm do Prisma, de outro ORM ou de uma API externa — ele só conhece um contrato (interface). Isso permite trocar de banco ou de estratégia de acesso a dados no futuro alterando só a implementação, sem tocar nas regras de negócio.

### In-memory repositories

As implementações em `src/repositories/in-memory` guardam os dados temporariamente em arrays na memória, sem banco de dados. Elas são usadas principalmente nos testes unitários: são rápidas, previsíveis e permitem testar uma regra de negócio sem depender do Prisma, Docker ou PostgreSQL. Ao terminar o teste, os dados deixam de existir.

> ✅ **Vantagem:** velocidade e isolamento nos testes unitários. Sem precisar subir Docker, PostgreSQL ou aplicar migrations, os testes rodam em memória, ficando rápidos, determinísticos e livres de efeitos colaterais entre execuções (cada teste começa com o array zerado). Isso também barateia o CI, já que testes unitários não dependem de infraestrutura externa.

### Inversão de dependência (SOLID)

O projeto aplica o princípio **D — Dependency Inversion Principle** do SOLID. Os casos de uso dependem de abstrações (as interfaces de repositório), e não diretamente do Prisma. Por exemplo, um caso de uso recebe um `UsersRepository`; ele funciona tanto com `PrismaUsersRepository` em produção quanto com `InMemoryUsersRepository` nos testes.

As factories em `src/use-cases/factories` fazem a composição da aplicação em produção: elas instanciam o repositório Prisma e o injetam no caso de uso. Isso reduz acoplamento, facilita testes e permite trocar a tecnologia de persistência sem reescrever as regras de negócio.

> ✅ **Vantagem:** é a peça que conecta tudo. Como os use cases dependem de abstrações e não de implementações concretas, ganha-se flexibilidade para injetar `PrismaUsersRepository` em produção e `InMemoryUsersRepository` nos testes sem duplicar lógica. Isso reduz acoplamento, torna o sistema mais fácil de manter e evolui bem — dá pra adicionar uma nova fonte de dados no futuro (Redis, outra API, outro ORM) sem quebrar o que já existe.

> 💡 **Em resumo:** cada camada isolada dá **testabilidade**, a inversão de dependência dá **flexibilidade**, e a separação de responsabilidades como um todo dá **manutenibilidade** — mudanças em uma camada não se propagam para as outras.

---

## 🐳 Por que usar Docker?

O Docker executa o PostgreSQL em um container isolado e reproduzível. Assim, todos que clonarem o projeto usam a mesma versão/configuração do banco, sem precisar instalar PostgreSQL diretamente na máquina.

O `docker-compose.yml` registra porta, usuário, senha e nome do banco. Com `docker compose up`, o ambiente necessário para a API fica disponível de forma padronizada, evitando diferenças de configuração entre máquinas e facilitando a remoção ou recriação do banco durante o desenvolvimento.

---

## 📐 Modelo de dados, segurança e erros

### Modelo de dados e persistência

O modelo está definido em `prisma/schema.prisma` e é persistido no PostgreSQL por meio do Prisma.

| Entidade | Campos principais | Relações |
| --- | --- | --- |
| `User` | `id`, `name`, `email`, `password_hash`, `role`, `created_at` | Um usuário possui vários check-ins. O e-mail é único. |
| `Gym` | `id`, `title`, `description`, `phone`, `latitude`, `longitude` | Uma academia possui vários check-ins. |
| `CheckIn` | `id`, `created_at`, `validated_at`, `user_id`, `gym_id` | Pertence a um usuário e a uma academia. |

O campo `role` usa os valores `MEMBER` e `ADMIN`. As migrations versionam as mudanças desse modelo e o Prisma executa as consultas ao banco de modo tipado.

### Segurança aplicada

- Senhas são armazenadas como hash com `bcryptjs`; a senha em texto puro não é persistida nem retornada nas respostas.
- A autenticação usa JWT. O token de acesso tem expiração curta e é enviado no header `Authorization: Bearer <token>`.
- Um refresh token é enviado em cookie `httpOnly`, reduzindo o acesso via JavaScript no navegador.
- O middleware `verifyJWT` protege as rotas autenticadas.
- O middleware `verifyUserRole` implementa autorização por papel (RBAC), exigindo `ADMIN` para criar academias e validar check-ins.
- Dados recebidos nas requisições são validados com Zod antes de chegar às regras de negócio.

### Tratamento de erros

A API devolve respostas HTTP de acordo com o tipo de falha:

| Status | Quando ocorre | Exemplo |
| --- | --- | --- |
| `400 Bad Request` | Dados inválidos ou erro de autenticação tratado. | Body fora do formato esperado, senha atual inválida ou credenciais inválidas. |
| `401 Unauthorized` | Token ausente/inválido ou usuário sem papel necessário. | Usuário `MEMBER` tentando criar uma academia. |
| `404 Not Found` | Recurso de usuário não existe em uma operação que trata essa condição. | Atualização ou exclusão de uma conta inexistente. |
| `409 Conflict` | Tentativa de cadastrar um e-mail já utilizado. | `POST /users` com e-mail duplicado. |
| `500 Internal Server Error` | Erro inesperado não tratado pela aplicação. | Falha interna de infraestrutura. |

Erros de validação do Zod são centralizados no manipulador de erros do Fastify e retornam `Validation error.`. Erros conhecidos, como credenciais inválidas, e-mail duplicado e usuário não encontrado nas operações correspondentes, são tratados pelos controllers com status específicos. Os demais erros passam pelo handler global, que retorna `500` sem expor detalhes internos ao cliente.

---

## 🛣️ Rotas principais

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/users` | Criar usuário. |
| `POST` | `/sessions` | Autenticar usuário e receber JWT. |
| `PATCH` | `/token/refresh` | Renovar token usando o cookie de refresh. |
| `GET` | `/me` | Obter perfil autenticado. |
| `PATCH` | `/users` | Atualizar a senha do usuário autenticado. |
| `DELETE` | `/users` | Excluir a própria conta autenticada. |
| `GET` | `/gyms/search?q=...` | Pesquisar academias. |
| `GET` | `/gyms/nearby?latitude=...&longitude=...` | Listar academias próximas. |
| `POST` | `/gyms` | Criar academia (`ADMIN`). |
| `POST` | `/gyms/:gymId/check-ins` | Fazer check-in. |
| `GET` | `/check-ins/history?page=1` | Consultar histórico de check-ins. |
| `GET` | `/check-ins/metrics` | Consultar total de check-ins. |
| `PATCH` | `/check-ins/:checkInId/validate` | Validar check-in (`ADMIN`). |

---
