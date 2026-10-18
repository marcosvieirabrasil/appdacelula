import { createFileRoute } from "@tanstack/react-router";
import html from "../pages-html/palavras.html?raw";
import { htmlResponse } from "../lib/serve-html";

// Serves the original static page as-is (own title, description and meta tags).
export const Route = createFileRoute("/palavras")({
  server: { handlers: { GET: () => htmlResponse(html) } },
});
