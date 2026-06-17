# Campus Order Hub

## 1. Problema escolhido

O sistema proposto resolve um problema ficticio, mas plausivel, de uma cantina universitaria: alunos fazem pedidos simples em horarios de pico, a equipe da cozinha precisa priorizar itens rapidos e o atendimento perde eficiencia quando pedidos e fila da cozinha sao controlados manualmente.

A solucao criada foi o **Campus Order Hub**, um sistema simples com interface web, separacao em microservicos e documentacao orientada aos criterios da prova.

## 2. Objetivo da solucao

O sistema permite:

1. Registrar pedidos pela interface web.
2. Classificar automaticamente pedidos pequenos como `FAST_TRACK`.
3. Persistir pedidos em banco de dados pg no `order-service`.
4. Propagar a criacao do pedido para o `kitchen-service`.
5. Visualizar, em tempo real simples por polling, a fila da cozinha.
6. Avancar o status operacional do pedido.

Nesta versao atualizada, os dados de pedidos e tickets passam a ser persistidos em **PostgreSQL** quando a aplicacao roda com `DATABASE_URL` configurada, incluindo o ambiente Docker Compose.

## 3. Stack adotada

- Frontend: React + Vite + Tailwind CSS
- Backend: Express + TypeScript
- Banco de dados: PostgreSQL
- Testes unitarios: Vitest
- Testes BDD: Cucumber + Supertest
- Containerizacao: Docker + Docker Compose

## 4. Microsservicos definidos

### 4.1 `order-service`

Responsabilidades:

- receber pedidos HTTP
- validar regras de entrada
- calcular prioridade
- salvar pedidos
- notificar outro servico quando um pedido for criado
- avancar status do pedido
- persistir pedidos em PostgreSQL

### 4.2 `kitchen-service`

Responsabilidades:

- receber tickets oriundos do `order-service`
- organizar a fila da cozinha
- priorizar tickets `FAST_TRACK`
- expor a fila para consumo da interface
- persistir tickets em PostgreSQL

### 4.3 `web`

Responsabilidades:

- capturar pedidos do usuario
- consultar pedidos e fila da cozinha
- exibir o fluxo operacional do sistema

## 5. Organizacao com Arquitetura Limpa

Cada microservico backend foi organizado por camadas:

- `domain`: entidades e regras centrais do dominio
- `application`: casos de uso e portas
- `infrastructure`: adaptadores concretos, persistencia e integracoes externas
- `app.ts` e `server.ts`: composicao HTTP e bootstrap

Os servicos fazem fallback para repositorios em memoria apenas quando `DATABASE_URL` nao esta presente, o que preserva a simplicidade dos testes automatizados.

Exemplo no `order-service`:

```text
services/order-service/src
├── domain
│   ├── entities
│   └── factories
├── application
│   ├── ports
│   └── use-cases
├── infrastructure
│   ├── integrations
│   ├── persistence
│   └── strategies
├── app.ts
└── server.ts
```

Essa estrutura reduz acoplamento, facilita testes e deixa explicito onde ficam regras de negocio e detalhes de framework.

## 6. Aplicacao de Clean Code

Evidencias praticas no codigo:

- nomes intencionais, como `CreateOrder`, `AdvanceOrderStatus`, `RegisterKitchenTicket`
- funcoes pequenas e com responsabilidade clara
- separacao entre regra de negocio e camada HTTP
- uso de tipos para reduzir ambiguidade
- dependencias injetadas por construtor
- ausencia de logica de negocio em controllers

Exemplo:

```ts
export class CreateOrder {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly priorityStrategy: PriorityStrategy,
    private readonly subscribers: OrderCreatedSubscriber[]
  ) {}
}
```

O caso de uso declara apenas aquilo que realmente precisa para operar.

## 7. Aplicacao dos principios SOLID

### S - Single Responsibility Principle

- `CreateOrder` cria pedidos
- `ListOrders` lista pedidos
- `AdvanceOrderStatus` avanca status
- `HttpKitchenNotifier` cuida apenas da comunicacao HTTP com a cozinha

### O - Open/Closed Principle

- novas estrategias de prioridade podem ser adicionadas sem alterar `CreateOrder`
- novos subscribers podem ser ligados ao fluxo de criacao sem reescrever a regra principal

### L - Liskov Substitution Principle

- qualquer implementacao de `OrderRepository` pode substituir `InMemoryOrderRepository`
- qualquer implementacao de `PriorityStrategy` pode substituir `ItemCountPriorityStrategy`

### I - Interface Segregation Principle

- interfaces pequenas e especificas como `OrderCreatedSubscriber`, `PriorityStrategy` e `KitchenQueueRepository`

### D - Dependency Inversion Principle

- casos de uso dependem de abstrações, nao de classes concretas
- `CreateOrder` depende de `OrderRepository`, `PriorityStrategy` e `OrderCreatedSubscriber`

## 8. Design Patterns utilizados

Foram aplicados pelo menos 4 padroes de projeto relevantes ao contexto:

### 8.1 Repository Pattern

- `OrderRepository`
- `KitchenQueueRepository`

Motivo: abstrair a persistencia e permitir alternar entre armazenamento em memoria e PostgreSQL sem alterar os casos de uso.

### 8.2 Factory Method

- `OrderFactory.create(...)`

Motivo: centralizar a criacao de pedidos com `id`, `createdAt` e estado inicial coerentes.

### 8.3 Strategy Pattern

- `PriorityStrategy`
- `ItemCountPriorityStrategy`

Motivo: encapsular o algoritmo de priorizacao sem acoplar a regra ao caso de uso.

### 8.4 Observer / Publish-Subscribe

- lista de `OrderCreatedSubscriber` injetada em `CreateOrder`

Motivo: permitir reacao ao evento de criacao do pedido sem acoplamento direto ao fluxo principal.

### 8.5 Adapter

- `HttpKitchenNotifier`

Motivo: adaptar a necessidade do dominio de "notificar a cozinha" para uma implementacao HTTP concreta.

## 9. TDD

Os testes unitarios foram criados para orientar o comportamento das regras centrais.

Exemplos implementados:

- `create-order.spec.ts`
  - cria pedido `FAST_TRACK`
  - valida notificacao de subscribers
  - rejeita pedido sem itens
- `advance-order-status.spec.ts`
  - valida a transicao de `CREATED` para `PREPARING`
- `list-kitchen-tickets.spec.ts`
  - garante prioridade da fila de cozinha

Fluxo TDD representado:

1. definir comportamento esperado
2. implementar teste
3. escrever codigo minimo para passar
4. refatorar mantendo testes verdes

## 10. BDD

Foi criado um cenario de comportamento com Gherkin no `order-service`:

```gherkin
Feature: Order creation
  Scenario: Create a fast-track order
    Given the order API is available
    When I submit an order for "Clara" with items:
      | Cafe |
      | Bolo |
    Then the response status should be 201
    And the created order priority should be "FAST_TRACK"
```

Objetivo do BDD aqui:

- expressar comportamento em linguagem proxima do negocio
- conectar requisito funcional a uma verificacao executavel
- demonstrar rastreabilidade entre regra e teste

## 11. Justificativas tecnicas

### React + Tailwind

- reduz tempo de implementacao
- facilita demonstracao visual da solucao
- Tailwind acelera prototipacao sem comprometer organizacao

### Express

- simples, direto e suficiente para o escopo da avaliacao
- evidencia separacao de camadas sem peso extra de framework

### Microsservicos pequenos

- deixam clara a separacao de responsabilidades
- demonstram comunicacao entre servicos
- tornam a avaliacao arquitetural mais objetiva

### Persistencia em memoria

- adequada para um prototipo de prova
- evita complexidade irrelevante para o objetivo academico
- mantem foco nos conceitos solicitados

### PostgreSQL

- agora utilizado como persistencia real da aplicacao
- reforca o criterio de uso de banco de dados em um contexto mais proximo de producao
- demonstra troca de infraestrutura sem alterar regras de negocio

## 12. Como executar localmente sem Docker

### Requisitos

- Node.js 22+
- npm 10+

### Passos

```bash
npm install
npm --workspace services/kitchen-service run dev
npm --workspace services/order-service run dev
npm --workspace apps/web run dev
```

URLs:

- Frontend: http://localhost:5173
- Order Service: http://localhost:3001
- Kitchen Service: http://localhost:3002
- PostgreSQL: localhost:5432

## 13. Como executar com Docker Compose

```bash
docker compose up --build
```

Servicos expostos:

- `web` em `http://localhost:5173`
- `order-service` em `http://localhost:3001`
- `kitchen-service` em `http://localhost:3002`
- `postgres` em `localhost:5432`

## 14. Como rodar os testes

### Testes unitarios do `order-service`

```bash
npm --workspace services/order-service run test:unit
```

### Testes BDD do `order-service`

```bash
npm --workspace services/order-service run test:bdd
```

### Testes unitarios do `kitchen-service`

```bash
npm --workspace services/kitchen-service run test:unit
```
