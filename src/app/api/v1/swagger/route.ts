import { enforceRateLimit } from '@/lib/obj3-api'

export const dynamic = 'force-dynamic'

const swaggerHtml = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>OBJ-3 API Swagger UI</title>
    <link rel="stylesheet" href="/swagger-ui/swagger-ui.css" />
    <style>
      body {
        margin: 0;
        background: #f8fafc;
      }

      .topbar {
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/swagger-ui/swagger-ui-bundle.js"></script>
    <script src="/swagger-ui/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function() {
        if (!window.SwaggerUIBundle || !window.SwaggerUIStandalonePreset) {
          document.getElementById('swagger-ui').innerHTML =
            '<div style="font-family: sans-serif; padding: 16px;">Swagger UI konnte nicht geladen werden. /api/v1/openapi.json direkt nutzen.</div>'
          return
        }

        window.SwaggerUIBundle({
          url: '/api/v1/openapi.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [window.SwaggerUIBundle.presets.apis, window.SwaggerUIStandalonePreset],
          layout: 'BaseLayout',
          docExpansion: 'list',
        })
      }
    </script>
  </body>
</html>`

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1' })
  if (rateLimited) {
    return rateLimited
  }

  return new Response(swaggerHtml, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
