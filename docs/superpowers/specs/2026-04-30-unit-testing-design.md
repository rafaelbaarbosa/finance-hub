# Unit Testing — Design Spec

**Date:** 2026-04-30
**Project:** automated-finance
**Stack:** Next.js 16, JavaScript, Jest + next/jest (SWC), React Testing Library

---

## Escopo

### O que testar

| Arquivo | Razão |
|---|---|
| `app/api/analyze/route.js` | Lógica condicional real: normalização de categories, múltiplos caminhos de erro |
| `components/CategoryCards/CategoryCards.jsx` | Branch `isTop` para destaque dourado, renderização de valores |
| `components/TransactionTable/TransactionTable.jsx` | Filtro por busca e categoria com estado local |

### O que não testar

- `store/useAnalysisStore.js` — 3 linhas triviais, sem lógica condicional
- `components/ExpenseChart/` — Recharts em SVG/canvas, sem valor real em unit tests
- `components/UploadArea/` — file input + fetch, melhor coberto por E2E
- `app/page.js`, `app/dashboard/page.js` — wrappers finos sem lógica própria

---

## Reorganização de arquivos

Todos os componentes migram para pastas individuais com `index.js` de re-export para manter a sintaxe dos imports existentes (`@/components/ComponentName`).

```
components/
  CategoryCards/
    index.js              ← export { default } from "./CategoryCards"
    CategoryCards.jsx
    tests/
      CategoryCards.test.jsx
  TransactionTable/
    index.js
    TransactionTable.jsx
    tests/
      TransactionTable.test.jsx
  ExpenseChart/
    index.js
    ExpenseChart.jsx
  UploadArea/
    index.js
    UploadArea.jsx
  ui/                     ← shadcn components, sem reorganização

app/api/analyze/
  route.js
  tests/
    route.test.js
```

---

## Configuração

### Dependências

```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### `jest.config.mjs`

```js
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const customConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: ['node_modules/(?!(unpdf)/)'],
  testMatch: ['**/?(*.)+(test).js?(x)'], // JS-only
};

export default createJestConfig(customConfig);
```

> `transformIgnorePatterns` inclui `unpdf` explicitamente pois é ESM-only e o transformer SWC não o processa por padrão.

### `jest.setup.js`

```js
import '@testing-library/jest-dom';
```

### `package.json` — adicionar script

```json
"test": "jest",
"test:watch": "jest --watch"
```

---

## Estratégia de mocks

### `route.test.js`

```js
jest.mock('unpdf', () => ({
  getDocumentProxy: jest.fn(),
  extractText: jest.fn(),
}));

jest.mock('groq-sdk', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));
```

### Componentes

Nenhum mock externo. Os componentes recebem dados via props — os testes passam fixtures diretamente.

---

## Casos de teste

### `app/api/analyze/tests/route.test.js`

1. Retorna 400 quando nenhum arquivo é enviado no FormData
2. Retorna 400 quando `extractText` retorna string vazia
3. Retorna dados com `categories` quando Groq os inclui na resposta
4. Computa `categories` no servidor quando Groq omite o array
5. Retorna 500 em erro genérico do Groq

### `components/CategoryCards/tests/CategoryCards.test.jsx`

1. Renderiza o número correto de cards
2. O primeiro card (índice 0) tem a classe `bg-accent`
3. Os demais cards não têm `bg-accent`
4. Exibe o valor total de cada categoria formatado em BRL

### `components/TransactionTable/tests/TransactionTable.test.jsx`

1. Exibe todas as transações por padrão
2. Filtro por busca reduz as linhas visíveis
3. Busca sem correspondência exibe o estado vazio
4. Clicar em chip de categoria filtra as transações corretamente
5. Clicar em "Todas" volta a exibir todas as transações
6. O contador de registros reflete o número de itens filtrados

---

## Fixtures compartilhadas

Dados de teste definidos no topo de cada arquivo de teste (sem arquivo compartilhado — escopo simples não justifica):

```js
const mockCategories = [
  { name: 'Alimentação', total: 800, count: 5, percentage: 50 },
  { name: 'Transporte', total: 400, count: 3, percentage: 25 },
  { name: 'Outros', total: 400, count: 2, percentage: 25 },
];

const mockTransactions = [
  { date: '01/05', description: 'iFood', amount: 50, category: 'Alimentação' },
  { date: '02/05', description: 'Uber', amount: 30, category: 'Transporte' },
  { date: '03/05', description: 'Netflix', amount: 40, category: 'Entretenimento' },
];
```
