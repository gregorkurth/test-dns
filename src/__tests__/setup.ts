// Vitest Setup - wird vor jedem Test ausgefuehrt
import '@testing-library/jest-dom'

// Auth-Konfiguration fuer Tests (ersetzt die entfernten Default-Credentials)
process.env.OBJ12_SESSION_SECRET = 'vitest-test-only-secret-not-for-production-use'
process.env.OBJ12_LOCAL_USERS_JSON = JSON.stringify([
  { username: 'viewer', role: 'viewer', password: 'viewer-demo' },
  { username: 'operator', role: 'operator', password: 'operator-demo' },
  { username: 'admin', role: 'admin', password: 'admin-demo' },
])
