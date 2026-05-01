# Unit Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Instalar e configurar Jest com next/jest + React Testing Library e escrever testes unitários para a API route, CategoryCards e TransactionTable.

**Architecture:** Jest com SWC transformer via `next/jest`, `jest-environment-jsdom` para componentes React, `@testing-library/user-event` para interações. Componentes são reorganizados em pastas individuais com `index.js` de re-export antes dos testes serem criados.

**Tech Stack:** Jest 29+, next/jest (SWC), @testing-library/react, @testing-library/jest-dom, @testing-library/user-event

---

## Mapa de arquivos

| Ação | Arquivo |
|---|---|
| Criar | `jest.config.mjs` |
| Criar | `jest.setup.js` |
| Modificar | `package.json` — adicionar scripts test/test:watch |
| Criar pasta + mover | `components/CategoryCards/CategoryCards.jsx` (de `components/CategoryCards.jsx`) |
| Criar | `components/CategoryCards/index.js` |
| Criar pasta + mover | `components/TransactionTable/TransactionTable.jsx` (de `components/TransactionTable.jsx`) |
| Criar | `components/TransactionTable/index.js` |
| Criar pasta + mover | `components/ExpenseChart/ExpenseChart.jsx` (de `components/ExpenseChart.jsx`) |
| Criar | `components/ExpenseChart/index.js` |
| Criar pasta + mover | `components/UploadArea/UploadArea.jsx` (de `components/UploadArea.jsx`) |
| Criar | `components/UploadArea/index.js` |
| Criar | `components/CategoryCards/tests/CategoryCards.test.jsx` |
| Criar | `components/TransactionTable/tests/TransactionTable.test.jsx` |
| Criar | `app/api/analyze/tests/route.test.js` |

---

## Task 1: Instalar dependências e configurar Jest

**Files:**
- Criar: `jest.config.mjs`
- Criar: `jest.setup.js`
- Modificar: `package.json`

- [ ] **Step 1: Instalar dependências**

```bash
cd /Users/rafaelbarbosa/Desktop/dev/automated-finance
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Saída esperada: `added N packages`

- [ ] **Step 2: Criar `jest.config.mjs`**

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
  testMatch: ['**/?(*.)+(test).js?(x)'],
};

export default createJestConfig(customConfig);
```

- [ ] **Step 3: Criar `jest.setup.js`**

```js
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Adicionar scripts em `package.json`**

No objeto `"scripts"`, adicionar após `"lint"`:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 5: Verificar configuração com teste de fumaça**

Criar `jest.smoke.test.js` na raiz:

```js
test('jest is configured', () => {
  expect(1 + 1).toBe(2);
});
```

Rodar:
```bash
npm test -- jest.smoke.test.js
```

Saída esperada: `PASS jest.smoke.test.js` com 1 passing test.

- [ ] **Step 6: Remover arquivo de fumaça e commitar**

```bash
rm jest.smoke.test.js
git add jest.config.mjs jest.setup.js package.json package-lock.json
git commit -m "test: configure Jest with next/jest and React Testing Library"
```

---

## Task 2: Reorganizar componentes em pastas individuais

**Files:**
- Mover + criar index: CategoryCards, TransactionTable, ExpenseChart, UploadArea

- [ ] **Step 1: Criar pastas e mover arquivos**

```bash
mkdir -p components/CategoryCards components/TransactionTable components/ExpenseChart components/UploadArea
mv components/CategoryCards.jsx components/CategoryCards/CategoryCards.jsx
mv components/TransactionTable.jsx components/TransactionTable/TransactionTable.jsx
mv components/ExpenseChart.jsx components/ExpenseChart/ExpenseChart.jsx
mv components/UploadArea.jsx components/UploadArea/UploadArea.jsx
```

- [ ] **Step 2: Criar `components/CategoryCards/index.js`**

```js
export { default } from './CategoryCards';
```

- [ ] **Step 3: Criar `components/TransactionTable/index.js`**

```js
export { default } from './TransactionTable';
```

- [ ] **Step 4: Criar `components/ExpenseChart/index.js`**

```js
export { default } from './ExpenseChart';
```

- [ ] **Step 5: Criar `components/UploadArea/index.js`**

```js
export { default } from './UploadArea';
```

- [ ] **Step 6: Verificar que o app ainda compila**

```bash
npm run build
```

Saída esperada: build sem erros. Se houver erros de import, verificar se algum arquivo importa diretamente o arquivo `.jsx` pelo path antigo (ex: `@/components/CategoryCards.jsx`) em vez do alias (`@/components/CategoryCards`).

- [ ] **Step 7: Commitar**

```bash
git add components/
git commit -m "refactor: reorganize components into individual folders with index re-exports"
```

---

## Task 3: Testes da API route

**Files:**
- Criar: `app/api/analyze/tests/route.test.js`

- [ ] **Step 1: Criar pasta de testes**

```bash
mkdir -p app/api/analyze/tests
```

- [ ] **Step 2: Criar `app/api/analyze/tests/route.test.js` com mocks e helpers**

```js
import { getDocumentProxy, extractText } from 'unpdf';
import Groq from 'groq-sdk';
import { POST } from '../route.js';

jest.mock('unpdf', () => ({
  getDocumentProxy: jest.fn(),
  extractText: jest.fn(),
}));

jest.mock('groq-sdk', () => {
  const mockCreate = jest.fn();
  const MockGroq = jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  }));
  MockGroq._mockCreate = mockCreate;
  return { default: MockGroq };
});

function buildRequest(file = null) {
  return {
    formData: jest.fn().mockResolvedValue({
      get: jest.fn().mockReturnValue(file),
    }),
  };
}

function buildMockFile() {
  return {
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
  };
}

function groqResponse(data) {
  return {
    choices: [{ message: { content: JSON.stringify(data) } }],
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  getDocumentProxy.mockResolvedValue({ _proxy: true });
  extractText.mockResolvedValue({ text: 'Transação iFood R$ 50,00' });
});
```

- [ ] **Step 3: Escrever teste — 400 sem arquivo**

Adicionar ao mesmo arquivo:

```js
describe('POST /api/analyze', () => {
  test('returns 400 when no file is provided', async () => {
    const response = await POST(buildRequest(null));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Nenhum arquivo enviado.');
  });
```

- [ ] **Step 4: Rodar e confirmar falha (arquivo não existe)**

```bash
npm test -- app/api/analyze/tests/route.test.js
```

Saída esperada: erro de importação ou falha de teste — confirma que o arquivo precisa ser escrito.

- [ ] **Step 5: Escrever restantes dos 4 testes**

Continuar no mesmo `describe`:

```js
  test('returns 400 when PDF text is empty', async () => {
    extractText.mockResolvedValueOnce({ text: '   ' });

    const response = await POST(buildRequest(buildMockFile()));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/Não foi possível extrair texto/);
  });

  test('returns data when Groq includes categories', async () => {
    const mockData = {
      period: 'Março 2024',
      totalAmount: 50,
      transactions: [{ date: '01/03', description: 'iFood', amount: 50, category: 'Alimentação' }],
      categories: [{ name: 'Alimentação', total: 50, count: 1, percentage: 100 }],
    };
    Groq._mockCreate.mockResolvedValueOnce(groqResponse(mockData));

    const response = await POST(buildRequest(buildMockFile()));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.period).toBe('Março 2024');
    expect(body.categories).toHaveLength(1);
    expect(body.categories[0].name).toBe('Alimentação');
  });

  test('computes categories server-side when Groq omits the array', async () => {
    const mockData = {
      period: 'Março 2024',
      totalAmount: 150,
      transactions: [
        { date: '01/03', description: 'iFood', amount: 100, category: 'Alimentação' },
        { date: '02/03', description: 'Uber', amount: 50, category: 'Transporte' },
      ],
    };
    Groq._mockCreate.mockResolvedValueOnce(groqResponse(mockData));

    const response = await POST(buildRequest(buildMockFile()));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.categories).toHaveLength(2);
    expect(body.categories[0].name).toBe('Alimentação');
    expect(body.categories[0].total).toBe(100);
    expect(body.categories[0].percentage).toBe(66.67);
    expect(body.categories[1].name).toBe('Transporte');
    expect(body.categories[1].total).toBe(50);
  });

  test('returns 500 on Groq error', async () => {
    Groq._mockCreate.mockRejectedValueOnce(new Error('API timeout'));

    const response = await POST(buildRequest(buildMockFile()));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toMatch(/Erro ao processar/);
  });
});
```

- [ ] **Step 6: Rodar testes e confirmar todos passam**

```bash
npm test -- app/api/analyze/tests/route.test.js
```

Saída esperada: `PASS` com 5 testes passing.

Se `Groq._mockCreate` for `undefined`, verificar se a importação de `Groq` está correta e se o jest.mock foi declarado antes do import.

- [ ] **Step 7: Commitar**

```bash
git add app/api/analyze/tests/route.test.js
git commit -m "test: add API route tests for analyze endpoint"
```

---

## Task 4: Testes do CategoryCards

**Files:**
- Criar: `components/CategoryCards/tests/CategoryCards.test.jsx`

- [ ] **Step 1: Criar pasta de testes**

```bash
mkdir -p components/CategoryCards/tests
```

- [ ] **Step 2: Criar `components/CategoryCards/tests/CategoryCards.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react';
import CategoryCards from '../CategoryCards';

const mockCategories = [
  { name: 'Alimentação', total: 800, count: 5, percentage: 53.33 },
  { name: 'Transporte', total: 400, count: 3, percentage: 26.67 },
  { name: 'Outros', total: 300, count: 2, percentage: 20 },
];

test('renders one element per category', () => {
  render(<CategoryCards categories={mockCategories} />);

  expect(screen.getByText('Alimentação')).toBeInTheDocument();
  expect(screen.getByText('Transporte')).toBeInTheDocument();
  expect(screen.getByText('Outros')).toBeInTheDocument();
});

test('first card has bg-accent class', () => {
  const { container } = render(<CategoryCards categories={mockCategories} />);

  const accentCards = container.querySelectorAll('.bg-accent');
  expect(accentCards).toHaveLength(1);
});

test('only the first card has bg-accent', () => {
  const { container } = render(<CategoryCards categories={mockCategories} />);

  const allCards = container.querySelectorAll('[class*="rounded-sm"]');
  const accentCards = container.querySelectorAll('.bg-accent');

  expect(allCards.length).toBeGreaterThan(1);
  expect(accentCards).toHaveLength(1);
});

test('displays category totals formatted in BRL', () => {
  render(<CategoryCards categories={mockCategories} />);

  expect(screen.getByText(/800/)).toBeInTheDocument();
  expect(screen.getByText(/400/)).toBeInTheDocument();
  expect(screen.getByText(/300/)).toBeInTheDocument();
});
```

- [ ] **Step 3: Rodar testes e confirmar passam**

```bash
npm test -- components/CategoryCards/tests/CategoryCards.test.jsx
```

Saída esperada: `PASS` com 4 testes passing.

Se aparecer erro de `lucide-react`, adicionar mock em `jest.config.mjs`:
```js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
  'lucide-react': '<rootDir>/__mocks__/lucide-react.js',
},
```
E criar `__mocks__/lucide-react.js`:
```js
const mock = () => null;
module.exports = new Proxy({}, { get: () => mock });
```

- [ ] **Step 4: Commitar**

```bash
git add components/CategoryCards/tests/CategoryCards.test.jsx
git commit -m "test: add CategoryCards unit tests"
```

---

## Task 5: Testes do TransactionTable

**Files:**
- Criar: `components/TransactionTable/tests/TransactionTable.test.jsx`

- [ ] **Step 1: Criar pasta de testes**

```bash
mkdir -p components/TransactionTable/tests
```

- [ ] **Step 2: Criar `components/TransactionTable/tests/TransactionTable.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionTable from '../TransactionTable';

const mockTransactions = [
  { date: '01/05', description: 'iFood', amount: 50, category: 'Alimentação' },
  { date: '02/05', description: 'Uber', amount: 30, category: 'Transporte' },
  { date: '03/05', description: 'Netflix', amount: 40, category: 'Entretenimento' },
];

test('shows all transactions by default', () => {
  render(<TransactionTable transactions={mockTransactions} />);

  expect(screen.getByText('iFood')).toBeInTheDocument();
  expect(screen.getByText('Uber')).toBeInTheDocument();
  expect(screen.getByText('Netflix')).toBeInTheDocument();
});

test('filters transactions by search term', async () => {
  const user = userEvent.setup();
  render(<TransactionTable transactions={mockTransactions} />);

  await user.type(screen.getByPlaceholderText('Buscar descrição...'), 'iFood');

  expect(screen.getByText('iFood')).toBeInTheDocument();
  expect(screen.queryByText('Uber')).not.toBeInTheDocument();
  expect(screen.queryByText('Netflix')).not.toBeInTheDocument();
});

test('shows empty state when search has no results', async () => {
  const user = userEvent.setup();
  render(<TransactionTable transactions={mockTransactions} />);

  await user.type(screen.getByPlaceholderText('Buscar descrição...'), 'xyz_nao_existe');

  expect(screen.getByText('Nenhuma transação encontrada.')).toBeInTheDocument();
});

test('filters transactions by category chip', async () => {
  const user = userEvent.setup();
  render(<TransactionTable transactions={mockTransactions} />);

  await user.click(screen.getByRole('button', { name: 'Alimentação' }));

  expect(screen.getByText('iFood')).toBeInTheDocument();
  expect(screen.queryByText('Uber')).not.toBeInTheDocument();
  expect(screen.queryByText('Netflix')).not.toBeInTheDocument();
});

test('"Todas" chip resets category filter', async () => {
  const user = userEvent.setup();
  render(<TransactionTable transactions={mockTransactions} />);

  await user.click(screen.getByRole('button', { name: 'Alimentação' }));
  await user.click(screen.getByRole('button', { name: 'Todas' }));

  expect(screen.getByText('iFood')).toBeInTheDocument();
  expect(screen.getByText('Uber')).toBeInTheDocument();
  expect(screen.getByText('Netflix')).toBeInTheDocument();
});

test('record counter reflects filtered results', async () => {
  const user = userEvent.setup();
  render(<TransactionTable transactions={mockTransactions} />);

  expect(screen.getByText('3 registros')).toBeInTheDocument();

  await user.type(screen.getByPlaceholderText('Buscar descrição...'), 'iFood');

  expect(screen.getByText('1 registro')).toBeInTheDocument();
});
```

- [ ] **Step 3: Rodar testes e confirmar passam**

```bash
npm test -- components/TransactionTable/tests/TransactionTable.test.jsx
```

Saída esperada: `PASS` com 6 testes passing.

- [ ] **Step 4: Rodar todos os testes juntos**

```bash
npm test
```

Saída esperada: 3 suítes, 15 testes, todos passando.

- [ ] **Step 5: Commitar**

```bash
git add components/TransactionTable/tests/TransactionTable.test.jsx
git commit -m "test: add TransactionTable unit tests"
```
