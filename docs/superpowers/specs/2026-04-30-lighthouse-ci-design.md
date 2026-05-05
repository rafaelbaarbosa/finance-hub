# Lighthouse CI — Design Spec

**Date:** 2026-04-30
**Project:** automated-finance
**Branch:** ci/web-vitals

---

## Objetivo

Adicionar avaliação automática de Web Vitals e acessibilidade à pipeline de CI existente para **todas as páginas do projeto**. O merge de qualquer PR para `main` fica bloqueado se a performance ou acessibilidade de qualquer página regredir abaixo dos thresholds definidos.

**Estado atual:** o projeto tem duas páginas — `/` (upload) e `/dashboard`. Como `/dashboard` requer dados no Zustand store para renderizar (sem eles redireciona para `/`), apenas `/` é auditada nesta iteração. `/dashboard` será incluída quando testes E2E com dados mockados forem implementados. O `lighthouserc.mjs` está estruturado para receber novas URLs sem mudanças arquiteturais.

---

## Arquitetura

Novo job `lighthouse` adicionado ao `.github/workflows/ci.yml`, executado **após** o job `ci` passar (`needs: ci`). O job faz build do app, inicia o servidor, roda 3 auditorias Lighthouse e verifica os resultados contra thresholds.

```
PR aberto
  └── job: ci (lint → build → test:coverage)
        └── job: lighthouse (build → start server → lhci autorun)
              ├── PASS → merge liberado
              └── FAIL → merge bloqueado
```

Ferramenta: `@lhci/cli` via `npx @lhci/cli autorun` — sem dependência de GitHub App ou token externo.

---

## URL auditada

Apenas `http://localhost:3000/` (tela de upload).

`/dashboard` é excluída pois redireciona para `/` sem dados no Zustand store. Será incluída futuramente via testes E2E com dados mockados.

Quando novas páginas forem adicionadas ao projeto, devem ser incluídas manualmente em `lighthouserc.mjs` — esta é uma decisão explícita e consciente de incluir a página no orçamento de performance.

---

## Thresholds

### Scores gerais (bloqueiam merge)

| Categoria | Threshold |
|---|---|
| Performance | ≥ 80 |
| Acessibilidade | ≥ 90 |
| Best Practices | ≥ 90 |

### Core Web Vitals

| Métrica | Limite | Comportamento |
|---|---|---|
| LCP (Largest Contentful Paint) | ≤ 3.000ms | Bloqueia (`error`) |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | Bloqueia (`error`) |
| TBT (Total Blocking Time) | ≤ 300ms | Avisa (`warn`) |

TBT é proxy para INP/FID em ambiente Lighthouse. É `warn` (não bloqueia) porque ambientes CI tendem a ter mais variação em execução de JavaScript.

`numberOfRuns: 3` — média de 3 auditorias para reduzir ruído de ambiente CI.

Resultados enviados para `temporary-public-storage` (armazenamento público temporário gratuito do LHCI, sem configuração adicional).

---

## Arquivos a criar/modificar

| Arquivo | Ação |
|---|---|
| `lighthouserc.mjs` | Criar — configuração do LHCI |
| `.github/workflows/ci.yml` | Modificar — adicionar job `lighthouse` |
| `CLAUDE.md` | Modificar — documentar que novas páginas devem ser adicionadas ao `lighthouserc.mjs` |

---

## Configuração

### `lighthouserc.mjs`

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

### Novo job em `.github/workflows/ci.yml`

```yaml
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
      run: npx @lhci/cli autorun
```

---

## CLAUDE.md — nota a adicionar

```
## Lighthouse CI

O job `lighthouse` na pipeline de CI audita as páginas listadas em `lighthouserc.mjs`.

Ao adicionar uma nova página pública ao projeto, inclua a URL em `lighthouserc.mjs`:
- Adicione a URL ao array `ci.collect.url`
- Ajuste os thresholds em `ci.assert.assertions` se a página tiver características diferentes
```
