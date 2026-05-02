# Lighthouse CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar um job `lighthouse` à pipeline de CI que audita Web Vitals e acessibilidade da tela de upload, bloqueando merge se os thresholds forem violados.

**Architecture:** Novo job `lighthouse` no `ci.yml` que roda após o job `ci` (`needs: ci`). Usa `npx lhci autorun` com configuração em `lighthouserc.mjs`. Sem instalação de dependência — `lhci` é executado via `npx`.

**Tech Stack:** GitHub Actions, `@lhci/cli` (via npx), Next.js 16 (`npm run build` + `npm start`).

---

## Mapa de arquivos

| Ação | Arquivo |
|---|---|
| Criar | `lighthouserc.mjs` |
| Modificar | `.github/workflows/ci.yml` |
| Modificar | `CLAUDE.md` |

---

## Task 1: Criar configuração do Lighthouse CI

**Files:**
- Criar: `lighthouserc.mjs`

- [ ] **Step 1: Criar `lighthouserc.mjs` na raiz do projeto**

```js
export default {
  ci: {
    collect: {
      startServerCommand: 'npm start',
      url: ['http://localhost:3000/'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance':    ['error', { minScore: 0.8 }],
        'categories:accessibility':  ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'largest-contentful-paint':  ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift':   ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time':       ['warn',  { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

- [ ] **Step 2: Verificar a configuração localmente**

Build + LHCI local (pode demorar ~2 minutos):

```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
GROQ_API_KEY=ci_placeholder npm run build && npx lhci autorun
```

Saída esperada: relatório com scores para `http://localhost:3000/`. Se algum threshold falhar, os scores aparecem em vermelho e o processo retorna exit code 1. Scores locais tendem a ser mais altos que em CI — o importante é que o comando roda sem erros de configuração.

Se aparecer erro `Cannot find module` ou similar, verificar que o arquivo está na raiz do projeto.

- [ ] **Step 3: Commitar**

```bash
git add lighthouserc.mjs
git commit -m "ci: add Lighthouse CI configuration"
```

---

## Task 2: Adicionar job lighthouse ao workflow

**Files:**
- Modificar: `.github/workflows/ci.yml`

O arquivo atual tem apenas o job `ci`. Adicionar o job `lighthouse` após ele.

- [ ] **Step 1: Atualizar `.github/workflows/ci.yml`**

Conteúdo completo do arquivo após a modificação:

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
        env:
          GROQ_API_KEY: ci_placeholder

      - name: Test with coverage
        run: npm run test:coverage

  lighthouse:
    needs: ci
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          GROQ_API_KEY: ci_placeholder

      - name: Run Lighthouse CI
        run: npx lhci autorun
```

- [ ] **Step 2: Verificar sintaxe do YAML**

```bash
cat .github/workflows/ci.yml
```

Confirmar visualmente que os dois jobs (`ci` e `lighthouse`) aparecem no mesmo nível dentro de `jobs:`, e que `lighthouse` tem `needs: ci`.

- [ ] **Step 3: Commitar**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lighthouse job to GitHub Actions pipeline"
```

---

## Task 3: Atualizar CLAUDE.md

**Files:**
- Modificar: `CLAUDE.md`

- [ ] **Step 1: Adicionar seção Lighthouse CI ao final do `CLAUDE.md`**

Adicionar ao final do arquivo:

```markdown
## Lighthouse CI

O job `lighthouse` na pipeline de CI audita as páginas listadas em `lighthouserc.mjs` a cada PR.

Ao adicionar uma nova página pública ao projeto, inclua a URL em `lighthouserc.mjs`:
- Adicione a URL ao array `ci.collect.url`
- Ajuste os thresholds em `ci.assert.assertions` se a página tiver características diferentes

`/dashboard` não está incluída pois requer dados no Zustand store para renderizar. Será adicionada quando testes E2E com dados mockados forem implementados.
```

- [ ] **Step 2: Commitar**

```bash
git add CLAUDE.md
git commit -m "docs: document Lighthouse CI page management in CLAUDE.md"
```

---

## Task 4: Verificação final — push e pipeline

- [ ] **Step 1: Push da branch**

```bash
git push
```

- [ ] **Step 2: Abrir PR no GitHub e verificar a pipeline**

Abrir um PR da branch `ci/web-vitals` para `main` e confirmar que:
- O job `ci` aparece e passa (lint → build → test:coverage)
- O job `lighthouse` aparece após `ci` e roda automaticamente
- O summary do job `lighthouse` exibe os scores de cada categoria e os resultados das assertions
- A pipeline passa ou falha conforme os thresholds (se falhar, os scores insuficientes aparecem no log)

Saída esperada no log do job `lighthouse`:
```
Running Lighthouse 3 time(s) on http://localhost:3000/
✅ categories:performance >= 0.8
✅ categories:accessibility >= 0.9
✅ categories:best-practices >= 0.9
✅ largest-contentful-paint <= 3000ms
✅ cumulative-layout-shift <= 0.1
```
