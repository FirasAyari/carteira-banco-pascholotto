# Escopo Tecnico - Carteira Banco Pascholotto

## 1. Objetivo

Implementar a carteira Banco Pascholotto para permitir que operadores consultem contratos existentes, calculem a divida atualizada de parcelas em aberto, simulem e formalizem acordos e emitam boletos em PDF vinculados ao acordo.

O escopo considera uma entrega MVP produtiva, com dados de contratos e parcelas previamente cadastrados no banco, conforme premissa do desafio.

## 2. Entregaveis

- API C# para autenticacao, consulta de contratos, calculo da divida, simulacao/criacao de acordos e download de boletos.
- Frontend web para operadores acompanharem o fluxo operacional completo.
- Banco SQL Server com modelo relacional, seed inicial e persistencia de memoria de calculo, acordos, boletos e auditoria.
- Documentacao de execucao local, Docker e criterios funcionais.
- Testes automatizados para regras de negocio, fluxo de API e telas principais.

## 3. Arquitetura

A solucao esta dividida em camadas:

- `Pascholotto.Domain`: entidades centrais, enums e relacoes de negocio.
- `Pascholotto.Application`: DTOs, interfaces, excecoes e politicas puras de calculo.
- `Pascholotto.Infrastructure`: Entity Framework Core, SQL Server, autenticacao, seed, servicos de contratos/dividas/acordos e geracao de boletos.
- `Pascholotto.Api`: controllers REST, middleware de erro/correlacao, autenticacao JWT, CORS e health check.
- `frontend`: React, TypeScript e Vite com rotas por fluxo operacional.

## 4. Divisao Sugerida Para 7 Desenvolvedores

1. Backend contratos e modelo de dados: entidades, DbContext, seed e consultas.
2. Backend calculo de divida: politica financeira, persistencia da memoria e auditoria.
3. Backend acordos e boletos: simulacao, formalizacao, parcelas do acordo e PDF.
4. Backend plataforma: autenticacao JWT, middlewares, tratamento de erros, Docker e health check.
5. Frontend autenticacao e shell: login, sessao, layout e navegacao protegida.
6. Frontend operacao: busca/listagem/detalhe de contratos e assistente de negociacao.
7. Qualidade e integracao: testes automatizados, cenarios E2E de API, validacao do Docker Compose e documentacao final.

## 5. Fluxo Funcional

1. Operador autentica com usuario e senha.
2. Operador busca contrato por documento ou numero.
3. Sistema exibe dados do contrato e parcelas.
4. Operador recalcula a divida em uma data-base valida.
5. Sistema persiste a memoria do calculo com principal, multa, juros e total por parcela.
6. Operador informa quantidade de parcelas, entrada e primeiro vencimento.
7. Sistema simula o acordo e apresenta o cronograma.
8. Operador formaliza o acordo.
9. Sistema cria acordo ativo, parcelas do acordo, boletos em PDF e eventos de auditoria.
10. Operador acessa o detalhe do acordo e baixa os boletos.

## 6. Regras De Negocio

- Apenas contratos da carteira `Banco Pascholotto` sao processados.
- A divida considera parcelas com status `Open` ou `Overdue`.
- A formula MVP aplica multa de 2% e juros simples de 1% ao mes, proporcionais aos dias em atraso.
- Parcelas futuras entram no principal sem multa e sem juros.
- A data de calculo nao pode estar no passado.
- O acordo aceita de 1 a 12 parcelas.
- Entrada e opcional, nao pode ser negativa e deve ser menor que o total.
- Entrada exige ao menos 2 parcelas.
- O primeiro vencimento deve estar entre D+7 e D+30.
- A ultima parcela absorve diferencas de arredondamento.
- O contrato pode ter apenas 1 acordo ativo.
- Cada parcela do acordo recebe um boleto PDF.

## 7. APIs

- `POST /api/auth/login`: autentica operador e retorna JWT.
- `GET /api/contracts`: busca contratos por documento e/ou numero.
- `GET /api/contracts/{id}`: retorna detalhe do contrato.
- `POST /api/contracts/{id}/debt-calculations`: calcula e persiste memoria da divida.
- `POST /api/contracts/{id}/agreements/simulate`: monta simulacao do acordo.
- `POST /api/contracts/{id}/agreements`: formaliza acordo e gera boletos.
- `GET /api/agreements/{id}`: consulta acordo formalizado.
- `GET /api/agreements/{id}/boletos`: lista boletos do acordo.
- `GET /api/agreements/{id}/boletos/{installmentId}/pdf`: baixa boleto em PDF.
- `GET /health`: verifica disponibilidade da API.

## 8. Modelo De Dados

- `Users`: operador, hash de senha e papel.
- `Contracts`: contrato, cliente, documento, carteira e status.
- `Installments`: parcelas originais, vencimento, principal, pago e status.
- `DebtCalculations`: memoria consolidada da divida.
- `DebtCalculationItems`: detalhamento por parcela.
- `Agreements`: acordo formalizado, totais, entrada, parcelas e status.
- `AgreementInstallments`: parcelas do acordo.
- `BoletoDocuments`: dados do boleto e conteudo PDF.
- `AuditEvents`: rastreabilidade de calculo, acordo e geracao de boletos.

## 9. Rastreabilidade

Os valores calculados ficam persistidos em `DebtCalculations` e `DebtCalculationItems`. A formalizacao de acordo usa uma memoria de calculo especifica, mantendo o vinculo entre contrato, calculo, acordo, boletos e operador. Eventos em `AuditEvents` registram as principais acoes e payloads financeiros.

## 10. Seguranca E Operacao

- Autenticacao por JWT Bearer.
- Senhas com hash PBKDF2.
- Controllers protegidos por `[Authorize]`, exceto login.
- CORS parametrizado por configuracao.
- Erros padronizados com status HTTP, detalhe e trace id.
- Health check em `/health`.
- Variaveis de ambiente no Docker Compose para connection string, CORS e HTTPS local.

## 11. Boletos PDF

O MVP gera boleto em PDF no momento da formalizacao do acordo, contendo cliente, documento, contrato, acordo, parcela, vencimento, valor, linha digitavel e codigo de barras deterministico.

Integracao bancaria real, registro junto ao banco, remessa/retorno CNAB, validacao por convenio e homologacao bancaria ficam fora do escopo do MVP e devem ser tratados como evolucao antes de uso financeiro real.

## 12. Plano De Testes

- Testes unitarios das politicas de calculo de divida e plano de acordo.
- Testes de API para o fluxo completo: buscar contrato, calcular divida, simular, criar acordo, listar boletos e baixar PDF.
- Testes de API para rejeicoes: segunda negociacao ativa e data de calculo passada.
- Testes de frontend para login, busca de contratos, detalhe, negociacao e detalhe do acordo.
- Build de frontend e backend como criterio de aceite tecnico.

## 13. Criterios De Aceite

- Operador consegue autenticar e acessar a area interna.
- Contratos seed aparecem por documento ou numero.
- Divida e recalculada somente com parcelas abertas/vencidas.
- Memoria do calculo apresenta principal, multa, juros e total.
- Acordo pode ser simulado e formalizado respeitando as regras da carteira.
- Acordo formalizado gera boletos em PDF para as parcelas.
- Sistema impede segundo acordo ativo no mesmo contrato.
- Testes automatizados de backend e frontend passam.
- `docker compose up -d --build` sobe banco, API e frontend.
