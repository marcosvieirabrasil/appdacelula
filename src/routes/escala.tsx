import { createFileRoute } from "@tanstack/react-router";

// Keeps old shared links working without maintaining a second scale page.
export const Route = createFileRoute("/escala")({
  server: {
    handlers: {
      GET: () =>
        new Response(null, {
          status: 308,
          headers: {
            location: "/escalas",
            "cache-control": "public, max-age=0, must-revalidate",
          },
        }),
    },
  },
});
