# Carteira Banco Pascholotto

Aplicacao MVP para operacao de cobranca da carteira Banco Pascholotto, com:

- consulta de contratos
- calculo de divida
- simulacao e formalizacao de acordos
- emissao de boletos em PDF
- frontend web para uso do operador

## Stack

- Backend: `.NET 10`, `ASP.NET Core 10`, `EF Core 10`
- Frontend: `React 19`, `TypeScript`, `Vite`
- Banco: `SQL Server`
- Infra local: `Docker Compose`

## Estrutura do projeto

```text
.
├─ backend/
│  ├─ src/
│  └─ tests/
├─ frontend/
└─ docker-compose.yml
```

## Requisitos

Para rodar com Docker:

- `Docker Desktop`

Para rodar localmente sem Docker:

- `.NET SDK 10.0.202` ou compativel
- `Node.js 22+`
- `npm`
- `SQL Server LocalDB` no Windows
  ou ajuste da connection string em `backend/src/Pascholotto.Api/appsettings.json`

## Como rodar com Docker

Este e o jeito recomendado. O `docker compose` sobe:

- `sqlserver`
- `backend`
- `frontend`

Tambem cria o banco e faz o seed inicial automaticamente.

### Subir tudo

```powershell
docker compose up -d --build
```

### Acessos

- Frontend: `http://localhost:3000`
- API: `http://localhost:8080`
- Health check: `http://localhost:8080/health`
- SQL Server: `localhost:1433`

### Credenciais padrao

- Usuario: `operador`
- Senha: `Pascholotto123!`

### Contratos de exemplo

- `BP-2026-001` / documento `12345678901`
- `BP-2026-002` / documento `98765432100`

### Parar os containers

```powershell
docker compose down
```

### Parar e apagar o volume do banco

```powershell
docker compose down -v
```

## Como rodar localmente

## 1. Backend

O backend usa por padrao a connection string abaixo em `backend/src/Pascholotto.Api/appsettings.json`:

```json
"Server=(localdb)\\MSSQLLocalDB;Database=PascholottoMvp;Trusted_Connection=True;TrustServerCertificate=True;"
```

Se voce nao estiver usando LocalDB, ajuste esse valor antes de subir a API.

### Rodar a API

```powershell
cd backend
dotnet run --project src/Pascholotto.Api
```

A API sobe por padrao em:

- `http://localhost:5297`

O banco e o seed inicial sao aplicados automaticamente na inicializacao.

## 2. Frontend

Em outro terminal:

```powershell
cd frontend
npm install
npm run dev
```

O frontend sobe por padrao em:

- `http://localhost:5173`

No modo local, o `Vite` faz proxy de:

- `/api` -> `http://localhost:5297`
- `/health` -> `http://localhost:5297`

## Seed inicial

Na primeira subida da aplicacao, o projeto cria:

- 1 usuario operador
- 2 contratos de exemplo
- parcelas abertas, vencidas e pagas para demonstracao

Arquivo de referencia:

- [DatabaseSeeder.cs](backend/src/Pascholotto.Infrastructure/Persistence/Seed/DatabaseSeeder.cs)

## Testes

### Backend

```powershell
dotnet test backend/PascholottoMvp.slnx
```

### Frontend

```powershell
cd frontend
npm run test
```

### Cobertura do frontend

```powershell
cd frontend
npm run coverage
```

## Build

### Frontend

```powershell
cd frontend
npm run build
```

### Backend

```powershell
cd backend
dotnet build PascholottoMvp.slnx
```

## Fluxo principal da aplicacao

1. Fazer login com o operador padrao.
2. Buscar um contrato por documento ou numero.
3. Abrir o contrato.
4. Recalcular a divida.
5. Simular o acordo.
6. Formalizar o acordo.
7. Baixar os boletos em PDF.

## Observacoes

- O frontend esta 100% em portugues.
- O primeiro vencimento do acordo so aceita datas entre `D+7` e `D+30`.
- A data de calculo da divida nao aceita datas no passado.
- O sistema permite apenas `1 acordo ativo por contrato`.
- Esta entrega nao importa contratos; os dados ja existem no banco ou no seed.

