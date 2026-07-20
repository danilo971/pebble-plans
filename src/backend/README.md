# Cifra - Backend API

Backend do aplicativo de controle financeiro pessoal **Cifra**, construído com Express + TypeScript + PostgreSQL + Drizzle ORM.

## Stack

- **Runtime**: Node.js 22+ com ESM
- **Framework**: Express 4
- **Database**: PostgreSQL 16+
- **ORM**: Drizzle ORM
- **Auth**: JWT (access + refresh tokens)
- **Testes**: Vitest + Supertest
- **Containerização**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

## Requisitos

- Node.js 22+
- PostgreSQL 16+
- npm 10+

## Instalação

```bash
cd src/backend
npm install
```

## Configuração

Copie `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Variáveis obrigatórias:

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://user:pass@localhost:5432/cifra` |
| `JWT_SECRET` | Segredo para JWT (mín. 32 chars) | `meu-segredo-super-longo-para-jwt-tokens` |
| `REFRESH_TOKEN_SECRET` | Segredo para refresh tokens | `outro-segredo-longo-para-refresh-tokens` |

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia em modo desenvolvimento (hot reload) |
| `npm run build` | Compila TypeScript para produção |
| `npm start` | Inicia servidor em produção |
| `npm test` | Executa testes unitários e de integração |
| `npm run test:watch` | Testes em modo watch |
| `npm run lint` | Executa ESLint |
| `npm run db:push` | Aplica schema ao banco (Drizzle) |
| `npm run db:seed` | Popula banco com dados de demonstração |

## API Endpoints

### Autenticação

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Cria novo usuário |
| POST | `/api/auth/login` | Autentica e retorna tokens |
| POST | `/api/auth/refresh-token` | Renova access token |
| GET | `/api/auth/me` | Perfil do usuário autenticado |
| PUT | `/api/auth/me` | Atualiza perfil |
| POST | `/api/auth/logout` | Revoga refresh token |

### Transações

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/transactions` | Lista transações (paginado) |
| POST | `/api/transactions` | Cria transação |
| GET | `/api/transactions/:id` | Busca transação |
| PUT | `/api/transactions/:id` | Atualiza transação |
| DELETE | `/api/transactions/:id` | Remove transação |
| GET | `/api/transactions/dashboard` | Dados do dashboard |

### Cartões

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/cards` | Lista cartões |
| POST | `/api/cards` | Cria cartão |
| GET | `/api/cards/:id` | Busca cartão |
| PUT | `/api/cards/:id` | Atualiza cartão |
| DELETE | `/api/cards/:id` | Remove cartão |

### Contas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/accounts` | Lista contas |
| POST | `/api/accounts` | Cria conta |
| GET | `/api/accounts/:id` | Busca conta |
| PUT | `/api/accounts/:id` | Atualiza conta |
| DELETE | `/api/accounts/:id` | Remove conta |

### Metas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/goals` | Lista metas |
| POST | `/api/goals` | Cria meta |
| GET | `/api/goals/:id` | Busca meta |
| PUT | `/api/goals/:id` | Atualiza meta |
| DELETE | `/api/goals/:id` | Remove meta |

### Categorias

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/categories` | Lista categorias |
| POST | `/api/categories` | Cria categoria |
| GET | `/api/categories/:id` | Busca categoria |
| PUT | `/api/categories/:id` | Atualiza categoria |
| DELETE | `/api/categories/:id` | Remove categoria |

### Health Check

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Status geral |
| GET | `/health/live` | Liveness probe |
| GET | `/health/ready` | Readiness probe |

## Autenticação

Todas as rotas (exceto health e auth público) exigem o header:

```
Authorization: Bearer <access_token>
```

## Docker

```bash
# Com Docker Compose (backend + PostgreSQL)
docker-compose up -d

# Apenas build do backend
docker build -t cifra-backend ./src/backend
```

## Desenvolvimento

Para rodar o backend em desenvolvimento junto com o frontend:

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd src/backend
npm run dev
```

## Licença

Proprietário - Danilo971
