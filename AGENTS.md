# AGENTS.md
- Pages are hand-written HTML in src/pages-html/, served verbatim by TanStack server routes in src/routes/*.tsx; why: Lovable hosting only gives clean URLs (/dinamicas) through app routes, not plain files.
- Page scripts, styles and images live in public/ and are referenced with absolute paths.
- server.mjs is not used; the project runs with the standard Vite/TanStack setup.
