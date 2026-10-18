# src

Código-fonte organizado para crescer sem repetir.

- `layout/` — (futuro) componentes de sidebar/topbar compartilhados
- `pages/` — (futuro) templates de dinamicas/palavras/escalas
- `logic/` — lógica testável (ex: `escala.js` com regra justa)
- `data/` — (futuro) fontes de dinâmicas/palavras

`dist/` permanece como saída de produção. Por enquanto `dist/*.html` ainda é editado direto; migração para `vite build` quando o layout estabilizar.
