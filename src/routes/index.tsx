import { createFileRoute } from "@tanstack/react-router";
import html from "../pages-html/home.html?raw";
import { htmlResponse } from "../lib/serve-html";

// Serves the original static page as-is (own title, description and meta tags).
export const Route = createFileRoute("/")({
  server: { handlers: { GET: () => htmlResponse(html) } },
});
