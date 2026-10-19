import { createFileRoute } from "@tanstack/react-router";
import html from "../pages-html/escalas.html?raw";
import { htmlResponse } from "../lib/serve-html";

// Serves the original static page as-is (own title, description and meta tags).
export const Route = createFileRoute("/escalas")({
  head: () => ({
    meta: [
      { title: html.match(/<title>(.*?)<\/title>/)?.[1] ?? "App da Célula" },
      ...Array.from(html.matchAll(/<meta (name|property)="(description|og:title|og:description|og:type|twitter:card)" content="([^"]*)"/g), ([, kind, key, content]) => ({ [kind]: key, content })),
    ],
  }),
  server: { handlers: { GET: () => htmlResponse(html) } },
});
