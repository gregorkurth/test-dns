/**
 * Kopiert die benötigten Swagger UI Assets aus node_modules in public/swagger-ui/.
 * Wird via postinstall ausgeführt, damit die Dateien im Airgap-Betrieb
 * ohne CDN-Zugang verfügbar sind.
 */

import { cpSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const src = join(root, 'node_modules', 'swagger-ui-dist')
const dest = join(root, 'public', 'swagger-ui')

const files = [
  'swagger-ui.css',
  'swagger-ui-bundle.js',
  'swagger-ui-standalone-preset.js',
]

mkdirSync(dest, { recursive: true })

for (const file of files) {
  cpSync(join(src, file), join(dest, file))
}

console.log(`swagger-ui assets copied to public/swagger-ui/`)
