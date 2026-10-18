import { createFileRoute } from "@tanstack/react-router";
import html from "../pages-html/escala.html?raw";
import { htmlResponse } from "../lib/serve-html";

// Serves the original static page as-is (own title, description and meta tags).
export const Route = createFileRoute("/escala")({
  server: { handlers: { GET: () => htmlResponse(html) } },
});
