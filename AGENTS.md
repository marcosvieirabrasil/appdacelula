# AGENTS.md
- Pages are hand-written HTML in src/pages-html/, served verbatim by TanStack server routes in src/routes/*.tsx; why: Lovable hosting only gives clean URLs (/dinamicas) through app routes, not plain files.
- Page scripts, styles and images live in public/ and are referenced with absolute paths.
- server.mjs is not used; the project runs with the standard Vite/TanStack setup.
- Word favorites reuse the app's browser-local favorites pattern with a separate key and stable reference/theme identifiers; why: preserve the existing account-free experience without mixing words and dynamics.
- Shared mobile navigation overrides live in public/logo.css after the base styles; why: all handwritten pages load it and must keep the same menu layout.
