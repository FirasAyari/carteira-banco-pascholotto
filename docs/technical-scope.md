# Escopo Tecnico - Carteira Banco Pascholotto

## 1. Contexto E Objetivo

A demanda consiste em entregar uma jornada digital para operadores de cobranca da carteira Banco Pascholotto. O operador deve conseguir consultar contratos existentes, visualizar parcelas, recalcular a divida, simular uma proposta de acordo, formalizar o acordo e emitir boletos em PDF para envio ao cliente.

O escopo considera uma entrega MVP com qualidade produtiva, desenvolvida por um time de 7 desenvolvedores Full Stack que atuam nos canais digitais de uma empresa de cobranca.

## 2. Premissas

- Contratos e parcelas ja existem na base transacional ou sao carregados por seed para o MVP.
- A importacao de contratos nao faz parte desta entrega.
- O operador utiliza credenciais internas para acessar a jornada.
- A carteira alvo da entrega e `Banco Pascholotto`.
- A regra financeira do MVP pode ser parametrizada/evoluida, mas nesta entrega usa multa de 2% e juros simples de 1% ao mes.
- O boleto PDF gerado no MVP representa o documento operacional da proposta; registro bancario, CNAB e homologacao bancaria ficam como evolucao.
- A entrega deve rodar localmente via Docker Compose com frontend, API e SQL Server.

## 3. Fora Do Escopo Do MVP

- Integracao com core bancario real para registro de boleto.
- Remessa e retorno CNAB.
- Baixa automatica de pagamento.
- Importacao massiva de contratos.
- Motor externo de renegociacao ou ofertas pre-aprovadas.
- Controle granular de perfis alem do operador autenticado.
- Envio de boleto por e-mail, SMS ou WhatsApp.

## 4. Entregaveis

- API C# para autenticacao, consulta de contratos, calculo de divida, simulacao/criacao de acordos e download de boletos.
- Frontend web em portugues para o operador executar a jornada completa.
- Modelo relacional SQL Server com seed inicial, persistencia de memoria de calculo, acordos, boletos e auditoria.
- Docker Compose para subir banco, backend e frontend.
- Documentacao de execucao local, fluxo funcional, credenciais e criterios de aceite.
- Testes automatizados de regras de negocio, API, telas principais e fluxo e2e em Chromium.

## 5. Arquitetura Proposta

A solucao fica dividida em camadas para reduzir acoplamento entre regras de negocio, persistencia, API e interface.

- `Pascholotto.Domain`: entidades centrais, enums e relacoes de negocio.
- `Pascholotto.Application`: DTOs, interfaces, excecoes e politicas puras de calculo.
- `Pascholotto.Infrastructure`: Entity Framework Core, SQL Server, autenticacao, seed, servicos de contratos/dividas/acordos e geracao de boletos.
- `Pascholotto.Api`: controllers REST, middleware de erro/correlacao, autenticacao JWT, CORS e health check.
- `frontend`: React, TypeScript e Vite com rotas por fluxo operacional.
- `docker-compose.yml`: orquestracao local de SQL Server, API e frontend.

## 6. Modulos Funcionais

### 6.1 Autenticacao E Sessao

- Login de operador com usuario e senha.
- Emissao de JWT para consumo das APIs protegidas.
- Protecao das rotas internas do frontend.
- Tratamento de erro de credenciais invalidas.

### 6.2 Consulta De Contratos

- Busca por documento do cliente e/ou numero do contrato.
- Listagem de contratos da carteira Banco Pascholotto.
- Detalhe do contrato com cliente, documento, saldo em aberto, status e parcelas.
- Indicacao de acordo ativo quando existir.

### 6.3 Calculo Da Divida

- Calculo de principal, multa, juros e total por parcela elegivel.
- Persistencia da memoria de calculo.
- Bloqueio de data de calculo no passado.
- Auditoria do calculo executado pelo operador.

### 6.4 Simulacao E Formalizacao De Acordo

- Definicao de quantidade de parcelas, entrada opcional e primeiro vencimento.
- Validacao das regras comerciais da carteira.
- Simulacao do cronograma antes da formalizacao.
- Criacao de acordo ativo vinculado a uma memoria de calculo.
- Bloqueio de segundo acordo ativo para o mesmo contrato.

### 6.5 Boletos E Documentos

- Geracao de boleto PDF para cada parcela do acordo.
- Persistencia de linha digitavel, codigo de barras e conteudo do PDF.
- Download do boleto pelo detalhe do acordo.
- Auditoria da geracao dos boletos.

## 7. Divisao Recomendada Para 7 Desenvolvedores Full Stack

A divisao recomendada nao e separar pessoas apenas por frontend ou backend. Como o time e Full Stack, a melhor estrategia e dividir por frentes verticais, com cada pessoa responsavel por uma parte funcional ponta a ponta. Isso reduz bloqueios porque cada frente entrega API, regra, tela, testes e documentacao incrementalmente, enquanto contratos de API e DTOs sao pactuados no inicio.

| Pessoa | Frente Vertical | Responsabilidades | Entregaveis | Como Evita Bloqueio |
| --- | --- | --- | --- | --- |
| Dev 1 | Fundacao tecnica e integracao | Arquitetura, estrutura da solucao, Docker, configuracoes, padroes de erro, CORS, health check e revisao de integracao | Ambiente compilavel, `docker compose`, padroes transversais e base para as demais frentes | Entrega a base tecnica primeiro e atua como apoio para destravar dependencias entre frentes |
| Dev 2 | Autenticacao e sessao | Login, JWT, hash de senha, protecao de endpoints, sessao no frontend e rotas protegidas | Fluxo de login completo e contrato de autorizacao para chamadas autenticadas | Frontend e backend das demais frentes podem usar token real ou stub controlado desde o inicio |
| Dev 3 | Contratos e parcelas | Modelo de contratos, seed/base inicial, consultas, filtros, detalhe do contrato e tela da carteira | APIs e telas de busca, listagem e detalhe de contratos | Publica DTOs de contrato cedo para calculo, acordo e telas trabalharem em paralelo |
| Dev 4 | Calculo da divida | Politica financeira, memoria de calculo, validacoes de data, persistencia e auditoria do calculo | Calculo persistido, composicao por parcela e exibicao ao operador | Pode iniciar com testes unitarios da formula e fixtures antes da API final |
| Dev 5 | Acordos | Simulacao, formalizacao, regra de 1 acordo ativo, cronograma de parcelas e tela de negociacao | Jornada de simulacao e criacao de acordo | Usa contrato do calculo e pode desenvolver com payloads mockados enquanto a memoria final evolui |
| Dev 6 | Boletos e documentos | Linha digitavel, codigo de barras, geracao de PDF, armazenamento, download e detalhe do acordo | Boletos PDF vinculados ao acordo e tela de consulta/download | Pode validar PDF e download com acordo mockado antes da formalizacao final |
| Dev 7 | Qualidade, testes e hardening | Testes unitarios, API, Playwright Chromium, documentacao, criterios de aceite e validacao Docker | Suite automatizada, evidencias de execucao e documentacao final | Cria testes por contrato desde o inicio e identifica quebras de integracao rapidamente |

### 7.1 Estrategia Anti-Bloqueio

- Definir na primeira fase os contratos REST, DTOs principais e codigos de erro esperados.
- Permitir que frontend avance com mocks/fixtures alinhados aos DTOs enquanto endpoints finais sao implementados.
- Integrar em pequenos incrementos: login, busca, detalhe, calculo, simulacao, formalizacao e boleto.
- Manter Dev 1 como responsavel pela base tecnica e remocao de impedimentos de arquitetura/ambiente.
- Manter Dev 7 acompanhando as frentes com testes de contrato, testes e2e e criterios de aceite.
- Pactuar a formula financeira antes do desenvolvimento de calculo e acordo, evitando retrabalho entre Dev 4 e Dev 5.
- Evitar PRs grandes: cada frente deve entregar fatias verificaveis com build e testes passando.

### 7.2 Pontos De Dependencia Controlada

- Autenticacao desbloqueia chamadas protegidas, mas as demais frentes podem usar token mockado em desenvolvimento inicial.
- Contratos e parcelas desbloqueiam o calculo, mas Dev 4 pode iniciar pela politica pura de calculo com fixtures.
- Calculo desbloqueia a formalizacao, mas Dev 5 pode iniciar pela validacao de payload e simulacao com memoria mockada.
- Acordo desbloqueia boleto, mas Dev 6 pode iniciar a geracao de PDF a partir de um modelo de boleto definido.
- E2E depende do fluxo integrado, mas Dev 7 pode criar cenarios parciais desde as primeiras entregas.

### 7.3 Governanca Tecnica Das Frentes

- Dev 1 atua como guardiao da arquitetura, padroes de erro, contratos transversais e integracao entre camadas.
- Dev 7 atua como guardiao de qualidade, garantindo que cada frente entregue testes e evidencias antes da integracao final.
- Mudancas em DTOs, endpoints ou codigos de erro devem ser pactuadas antes da implementacao e revisadas por Dev 1 e Dev 7.
- Cada frente vertical deve publicar fixtures e exemplos de payload para permitir desenvolvimento paralelo do frontend, backend e testes.
- Contratos de API devem ser tratados como acordo entre frentes: uma vez usados por outra frente, mudancas devem ser versionadas ou coordenadas.

## 8. Plano De Execucao Sugerido

### Fase 1 - Fundacao Tecnica E Contratos De API

- Criar estrutura da solucao backend e frontend.
- Configurar Docker Compose com SQL Server, API e frontend.
- Definir padroes de erro, autenticacao, CORS e health check.
- Modelar entidades principais e seed inicial.
- Pactuar DTOs, endpoints, formatos de erro e fixtures base.
- Criar mocks de frontend e testes de contrato para permitir trabalho paralelo.

### Fase 2 - Consulta E Autenticacao

- Implementar login, JWT e sessao do operador.
- Implementar busca e detalhe de contratos.
- Criar telas de carteira e contrato.
- Cobrir fluxo com testes de API e frontend.
- Validar que contratos seed retornam dados suficientes para calculo, acordo e boleto.

### Fase 3 - Calculo E Negociacao

- Implementar politica de calculo da divida.
- Persistir memoria de calculo e itens calculados.
- Implementar simulacao de acordo.
- Implementar tela guiada de negociacao.
- Integrar calculo e simulacao sem formalizar acordo definitivo durante testes intermediarios.

### Fase 4 - Formalizacao, Boletos E Auditoria

- Criar acordo ativo e parcelas do acordo.
- Gerar boletos PDF.
- Implementar detalhe do acordo e download.
- Registrar eventos de auditoria.
- Validar rastreabilidade entre contrato, memoria de calculo, acordo, boleto e operador.

### Fase 5 - Validacao Final

- Executar testes unitarios, API, frontend e e2e Chromium.
- Validar `docker compose up -d --build`.
- Revisar README, escopo tecnico e criterios de aceite.
- Corrigir gaps de usabilidade, mensagens de erro e responsividade.
- Gerar evidencia do fluxo completo: login, busca, calculo, simulacao, formalizacao e download do boleto.

## 9. Regras De Negocio

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

## 10. Contratos De API

As APIs devem usar JSON, autenticacao JWT Bearer nos endpoints protegidos e respostas de erro padronizadas com `status`, `detail` e `traceId`.

| Endpoint | Entrada Principal | Saida Esperada | Erros Esperados |
| --- | --- | --- | --- |
| `POST /api/auth/login` | `username`, `password` | Token JWT, usuario e papel | `400` payload invalido, `401` credenciais invalidas |
| `GET /api/contracts` | `document` e/ou `contractNumber` | Lista resumida de contratos | `401` nao autenticado |
| `GET /api/contracts/{id}` | Identificador do contrato | Dados do contrato, parcelas e acordo ativo | `401` nao autenticado, `404` contrato inexistente |
| `POST /api/contracts/{id}/debt-calculations` | `calculationDate` opcional | Memoria da divida com principal, multa, juros e total | `400` data invalida, `401` nao autenticado, `404` contrato inexistente |
| `POST /api/contracts/{id}/agreements/simulate` | `debtCalculationId`, parcelas, entrada e primeiro vencimento | Cronograma simulado do acordo | `400` regras comerciais invalidas ou acordo ativo existente no MVP, `404` calculo inexistente |
| `POST /api/contracts/{id}/agreements` | Mesma estrutura da simulacao | Acordo formalizado com parcelas e boletos | `400` regras comerciais invalidas ou acordo ativo existente no MVP, `404` calculo inexistente |
| `GET /api/agreements/{id}` | Identificador do acordo | Detalhe do acordo, parcelas, boletos e auditoria | `401` nao autenticado, `404` acordo inexistente |
| `GET /api/agreements/{id}/boletos` | Identificador do acordo | Lista de boletos vinculados ao acordo | `401` nao autenticado, `404` acordo inexistente |
| `GET /api/agreements/{id}/boletos/{installmentId}/pdf` | Acordo e parcela | Arquivo `application/pdf` | `401` nao autenticado, `404` boleto inexistente |
| `GET /health` | Sem payload | Status de disponibilidade | `503` indisponibilidade operacional |

### 10.1 Padrao De Erro

- Validacoes de entrada retornam `400 Bad Request` com mensagem funcional clara.
- Falhas de autenticacao retornam `401 Unauthorized`.
- Recursos inexistentes retornam `404 Not Found`.
- No MVP, violacoes de regra de negocio retornam `400 Bad Request`; em hardening produtivo, conflitos concorrentes como segundo acordo ativo devem evoluir para `409 Conflict`.
- Todas as respostas de erro devem conter `traceId` para correlacao com logs.

## 11. Consistencia, Transacoes E Concorrencia

- No MVP, a formalizacao do acordo deve ocorrer em uma operacao unica de persistencia, criando acordo, parcelas, boletos e eventos de auditoria juntos.
- A regra de 1 acordo ativo por contrato deve ser validada no backend antes de simular ou formalizar um novo acordo.
- Para hardening produtivo, a regra de 1 acordo ativo deve ser protegida contra chamadas concorrentes com indice unico filtrado por `ContractId` e status ativo, ou transacao com isolamento adequado.
- Se a geracao de boleto falhar, o acordo nao deve ficar parcialmente criado sem boletos.
- A memoria de calculo usada para formalizacao deve pertencer ao mesmo contrato e permanecer vinculada ao acordo gerado.
- Operacoes financeiras devem registrar auditoria suficiente para reconstituir quem executou, quando executou e quais valores foram usados.

## 12. Modelo De Dados

- `Users`: operador, hash de senha, papel e data de criacao.
- `Contracts`: contrato, cliente, documento, carteira e status.
- `Installments`: parcelas originais, vencimento, principal, valor pago e status.
- `DebtCalculations`: memoria consolidada da divida.
- `DebtCalculationItems`: detalhamento por parcela calculada.
- `Agreements`: acordo formalizado, totais, entrada, valor financiado, quantidade de parcelas e status.
- `AgreementInstallments`: parcelas do acordo.
- `BoletoDocuments`: linha digitavel, codigo de barras, dados do pagador e conteudo PDF.
- `AuditEvents`: rastreabilidade de calculo, acordo e geracao de boletos.

## 13. Rastreabilidade E Auditoria

Os valores calculados ficam persistidos em `DebtCalculations` e `DebtCalculationItems`. A formalizacao do acordo usa uma memoria de calculo especifica, mantendo o vinculo entre contrato, calculo, acordo, boletos e operador.

Eventos em `AuditEvents` devem registrar as acoes relevantes:

- Calculo de divida executado.
- Acordo formalizado.
- Boletos gerados.

Essa rastreabilidade permite explicar ao operador e ao cliente como o valor final foi formado.

## 14. Privacidade, LGPD E Dados Pessoais

- CPF/CNPJ e dados do cliente devem ser tratados como dados pessoais da operacao.
- Logs tecnicos nao devem expor senha, token JWT, conteudo integral de PDF ou payloads financeiros desnecessarios.
- Quando aplicavel na interface, documentos podem ser exibidos de forma mascarada em listas e completos apenas no detalhe operacional.
- O acesso aos dados deve exigir operador autenticado.
- Auditoria deve registrar a acao e o operador, mas evitar persistir dados pessoais sem necessidade operacional.
- Configuracoes sensiveis, como connection string e segredo JWT, devem ficar fora do codigo e ser fornecidas por configuracao/variaveis de ambiente.

## 15. Requisitos Nao Funcionais

- Interface em portugues, objetiva e adequada ao uso operacional.
- API protegida por autenticacao JWT.
- Senhas armazenadas com hash seguro.
- Erros padronizados com status HTTP, detalhe e trace id.
- Health check disponivel para operacao local e Docker.
- Configuracoes sensiveis via variaveis de ambiente.
- Build backend e frontend sem erros.
- Testes automatizados executaveis localmente.
- Layout responsivo para uso em desktop e notebooks operacionais.

## 16. Seguranca, Observabilidade E Operacao

- Controllers protegidos por `[Authorize]`, exceto login.
- CORS parametrizado por configuracao.
- Connection string fora do codigo de aplicacao quando executado em container.
- Middleware centralizado para tratamento de excecoes.
- Docker Compose com servicos isolados para banco, API e frontend.
- Health check em `/health`.
- No MVP, respostas de erro devem expor `traceId` e logs devem registrar falhas com status HTTP.
- Para hardening produtivo, logs estruturados devem incluir `traceId`, rota, status HTTP e tempo de resposta.
- Acoes financeiras relevantes devem ser auditadas: calculo, formalizacao de acordo e geracao de boleto.
- Erros de negocio devem ser distinguiveis de erros tecnicos para facilitar suporte.
- Evidencias de execucao devem ser geradas por testes automatizados e fluxo e2e.

## 17. Boletos PDF

O MVP gera boleto em PDF no momento da formalizacao do acordo, contendo cliente, documento, contrato, acordo, parcela, vencimento, valor, linha digitavel e codigo de barras deterministico.

Esse boleto deve ser entendido como documento operacional/simulado do MVP. Ele nao representa boleto bancario registrado, nao possui conciliacao financeira real, nao confirma cobranca bancaria efetiva e nao deve ser usado como documento financeiro real sem integracao e homologacao bancaria.

Antes de uso financeiro real, devem ser adicionadas as seguintes evolucoes:

- Integracao com banco emissor.
- Registro do boleto.
- Validacao de convenio, carteira, agencia e conta.
- Homologacao bancaria.
- Rotina de remessa/retorno.
- Conciliacao de pagamento.

## 18. Plano De Testes

- Testes unitarios das politicas de calculo de divida e plano de acordo.
- Testes de API para buscar contrato, calcular divida, simular, criar acordo, consultar acordo, listar boletos e baixar PDF.
- Testes de API para rejeicoes: segunda negociacao ativa, data de calculo passada e parametros invalidos.
- Testes de frontend para login, busca de contratos, detalhe, negociacao e detalhe do acordo.
- Teste e2e com Playwright Chromium cobrindo login, busca, calculo, simulacao, formalizacao e download de boleto.
- Build de frontend e backend como criterio de aceite tecnico.

### 18.1 Comandos De Validacao Esperados

- `dotnet test backend/PascholottoMvp.slnx`: testes de backend passando.
- `cd frontend && npm run test`: testes de frontend passando.
- `cd frontend && npm run build`: build de producao do frontend sem erro.
- `cd frontend && npm run test:e2e`: fluxo e2e Chromium passando.
- `docker compose up -d --build`: banco, API e frontend sobem com sucesso.

## 19. Riscos E Mitigacoes

| Risco | Impacto | Mitigacao |
| --- | --- | --- |
| Regra financeira diferente da expectativa do negocio | Alto | Isolar politica de calculo e documentar formula usada no MVP |
| Boleto PDF ser confundido com boleto registrado | Alto | Documentar limitacao e separar evolucao bancaria do MVP |
| Acordos duplicados para o mesmo contrato | Medio | Validar 1 acordo ativo por contrato no backend; em producao, reforcar com restricao transacional ou indice unico |
| Divergencia entre frontend e API | Medio | Pactuar DTOs cedo e cobrir fluxo com testes de API/e2e |
| Ambiente local inconsistente | Medio | Usar Docker Compose e NuGet configurado no repositorio |
| Falta de rastreabilidade financeira | Alto | Persistir memoria de calculo e eventos de auditoria |
| Exposicao indevida de dados pessoais | Alto | Evitar dados pessoais em logs e restringir acesso a operadores autenticados |
| Falha parcial na criacao do acordo | Alto | Persistir acordo, parcelas, boletos e auditoria em uma unica operacao; em producao, reforcar com transacao explicita |

## 20. Criterios De Aceite

- Operador consegue autenticar e acessar a area interna.
- Contratos seed aparecem por documento ou numero.
- Detalhe do contrato apresenta parcelas, saldo e status.
- Divida e recalculada somente com parcelas abertas/vencidas.
- Memoria do calculo apresenta principal, multa, juros e total.
- Acordo pode ser simulado e formalizado respeitando as regras da carteira.
- Acordo formalizado gera parcelas e boletos em PDF.
- Operador consegue baixar boleto pelo detalhe do acordo.
- Sistema impede segundo acordo ativo no mesmo contrato.
- Eventos principais ficam registrados para auditoria.
- Testes automatizados de backend, frontend e e2e passam.
- `docker compose up -d --build` sobe banco, API e frontend.
- As limitacoes do boleto MVP estao documentadas e nao sao apresentadas como boleto bancario registrado.
- Dados pessoais nao sao expostos em logs tecnicos ou respostas de erro.

## 21. Definicao De Pronto

A entrega pode ser considerada pronta quando:

- Todos os criterios de aceite estiverem atendidos.
- Backend e frontend compilarem sem erro.
- Testes automatizados passarem.
- O fluxo principal funcionar em Chromium via Playwright.
- O README permitir execucao local por outra pessoa.
- As limitacoes do MVP estiverem documentadas.
- O escopo tecnico demonstrar como o time de 7 desenvolvedores trabalha em paralelo sem bloqueios criticos.

## 22. Separacao Entre MVP E Hardening Produtivo

O MVP entregue cobre a jornada funcional ponta a ponta exigida pelo desafio: login, consulta de contratos, calculo de divida, simulacao, formalizacao de acordo, geracao de boleto PDF, auditoria e validacao por testes automatizados.

Para evolucao produtiva em ambiente real de cobranca, devem ser tratados como hardening:

- retorno `409 Conflict` para conflitos concorrentes de acordo ativo;
- indice unico filtrado ou estrategia transacional explicita para impedir duplicidade de acordo ativo;
- request logging estruturado com tempo de resposta, rota e status HTTP;
- integracao bancaria real para boleto registrado, CNAB, conciliacao e homologacao;
- politicas corporativas completas de mascaramento, retencao e acesso a dados pessoais.
