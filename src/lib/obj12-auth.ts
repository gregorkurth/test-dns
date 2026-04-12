import {
  createHmac,
  createPublicKey,
  randomUUID,
  scryptSync,
  timingSafeEqual,
  verify as verifySignature,
} from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { NextResponse } from 'next/server'
import { z } from 'zod'

import { createObservabilityRequestId, emitSecuritySignal } from '@/lib/obj11-observability'
import { apiError, type ApiResponseShape } from '@/lib/obj3-api'

export type Obj12AuthMode = 'local' | 'oidc' | 'hybrid'
export type Obj12Role = 'viewer' | 'operator' | 'admin'
export type Obj12AuthProvider = 'local' | 'oidc'

export interface Obj12SessionClaims {
  version: 1
  sessionId: string
  subject: string
  username: string
  displayName: string
  email: string | null
  role: Obj12Role
  provider: Obj12AuthProvider
  issuedAt: string
  expiresAt: string
}

interface Obj12ConfiguredLocalUser {
  username: string
  role: Obj12Role
  displayName: string
  password?: string
  passwordHash?: string
  disabled?: boolean
}

interface Obj12JwtLikeClaims {
  sub?: string
  email?: string
  preferred_username?: string
  name?: string
  iss?: string
  aud?: string | string[]
  role?: string
  roles?: string[]
  realm_access?: {
    roles?: string[]
  }
  resource_access?: Record<string, { roles?: string[] }>
  groups?: string[]
}

interface Obj12JwtHeader {
  alg?: string
  typ?: string
  kid?: string
}

interface Obj12RsaJwk {
  kid?: string
  kty?: string
  alg?: string
  use?: string
  n?: string
  e?: string
}

interface Obj12VerifyResultSuccess {
  ok: true
  session: Obj12SessionClaims
}

interface Obj12VerifyResultFailure {
  ok: false
  code: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'AUTH_CONFIGURATION_ERROR'
  message: string
}

type Obj12VerifyResult = Obj12VerifyResultSuccess | Obj12VerifyResultFailure

const DEFAULT_SESSION_TTL_SECONDS = 8 * 60 * 60
const MIN_PRODUCTION_SESSION_SECRET_LENGTH = 32
const OIDC_JWKS_CACHE_TTL_MS = 5 * 60 * 1000
const revokedSessionTokens = new Map<string, number>()
let oidcJwksCache:
  | {
      url: string
      expiresAt: number
      keys: Obj12RsaJwk[]
    }
  | null = null
const ROLE_ORDER: Record<Obj12Role, number> = {
  viewer: 1,
  operator: 2,
  admin: 3,
}

const configuredLocalUserSchema = z
  .object({
    username: z.string().trim().min(1),
    role: z.string().trim().min(1),
    displayName: z.string().trim().min(1).optional(),
    password: z.string().min(1).optional(),
    passwordHash: z.string().min(1).optional(),
    disabled: z.boolean().optional(),
  })
  .refine((candidate) => Boolean(candidate.password || candidate.passwordHash), {
    message: 'Jeder lokale Benutzer benoetigt password oder passwordHash.',
  })


function parseAuthMode(value: string | undefined): Obj12AuthMode {
  const normalized = value?.trim().toLowerCase()
  if (normalized === 'local' || normalized === 'oidc' || normalized === 'hybrid') {
    return normalized
  }
  return 'hybrid'
}

function normalizeRole(value: string | null | undefined): Obj12Role | null {
  const normalized = value?.trim().toLowerCase()
  if (!normalized) {
    return null
  }

  if (['viewer', 'read', 'readonly', 'reader'].includes(normalized)) {
    return 'viewer'
  }
  if (['operator', 'write', 'writer', 'editor'].includes(normalized)) {
    return 'operator'
  }
  if (['admin', 'administrator'].includes(normalized)) {
    return 'admin'
  }

  return null
}

function getSessionSecret(): string {
  const configured = process.env.OBJ12_SESSION_SECRET?.trim()
  if (configured) {
    if (
      process.env.NODE_ENV === 'production' &&
      configured.length < MIN_PRODUCTION_SESSION_SECRET_LENGTH
    ) {
      throw new Error(
        `OBJ12 Session-Konfiguration ungueltig: OBJ12_SESSION_SECRET muss in Produktion mindestens ${MIN_PRODUCTION_SESSION_SECRET_LENGTH} Zeichen haben.`,
      )
    }
    return configured
  }

  throw new Error(
    'OBJ12 Session-Konfiguration ungueltig: OBJ12_SESSION_SECRET ist erforderlich. Bitte in .env.local setzen.',
  )
}

function getSessionTtlSeconds(): number {
  const rawSeconds = process.env.OBJ12_SESSION_TTL_SECONDS?.trim()
  if (rawSeconds) {
    const parsed = Number(rawSeconds)
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.trunc(parsed)
    }
  }

  const rawHours = process.env.OBJ12_SESSION_TTL_HOURS?.trim()
  if (rawHours) {
    const parsed = Number(rawHours)
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.trunc(parsed * 60 * 60)
    }
  }

  return DEFAULT_SESSION_TTL_SECONDS
}

function getAuthMode(): Obj12AuthMode {
  return parseAuthMode(process.env.OBJ12_AUTH_MODE)
}

function parseBooleanEnv(name: string): boolean | null {
  const raw = process.env[name]?.trim().toLowerCase()
  if (!raw) {
    return null
  }

  if (['1', 'true', 'yes', 'on'].includes(raw)) {
    return true
  }
  if (['0', 'false', 'no', 'off'].includes(raw)) {
    return false
  }

  return null
}

function allowUnsignedOidcTokenExchange(): boolean {
  const explicit = parseBooleanEnv('OBJ12_OIDC_ALLOW_UNSIGNED_TOKEN')
  if (explicit !== null) {
    return explicit
  }

  // Signaturverifizierung ist in allen Umgebungen Standard.
  // Nur via explizitem Opt-in deaktivierbar (OBJ12_OIDC_ALLOW_UNSIGNED_TOKEN=true).
  return false
}

function isLocalModeEnabled(): boolean {
  const mode = getAuthMode()
  return mode === 'local' || mode === 'hybrid'
}

function isOidcModeEnabled(): boolean {
  const mode = getAuthMode()
  return mode === 'oidc' || mode === 'hybrid'
}

function parseLocalUsers(raw: string): Obj12ConfiguredLocalUser[] {
  const parsed = JSON.parse(raw) as unknown
  const users = z.array(configuredLocalUserSchema).parse(parsed)
  return users
    .map((entry) => ({
      username: entry.username.trim(),
      role: normalizeRole(entry.role) ?? 'viewer',
      displayName: entry.displayName?.trim() || entry.username.trim(),
      password: entry.password,
      passwordHash: entry.passwordHash,
      disabled: entry.disabled ?? false,
    }))
    .filter((entry) => !entry.disabled)
}

function getConfiguredLocalUsers(): Obj12ConfiguredLocalUser[] {
  // 1. Env-Variable hat Vorrang
  const rawEnv = process.env.OBJ12_LOCAL_USERS_JSON?.trim()
  if (rawEnv) {
    return parseLocalUsers(rawEnv)
  }

  // 2. Separates Value-File (OBJ12_LOCAL_USERS_FILE oder Standard-Pfad)
  const filePath =
    process.env.OBJ12_LOCAL_USERS_FILE?.trim() ||
    join(process.cwd(), 'config', 'users.local.json')

  try {
    const content = readFileSync(filePath, 'utf-8')
    return parseLocalUsers(content)
  } catch {
    return []
  }
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function createSignature(value: string): Buffer {
  return createHmac('sha256', getSessionSecret()).update(value).digest()
}

function getOidcJwksUrl(): string | null {
  const explicit = process.env.OBJ12_OIDC_JWKS_URL?.trim()
  if (explicit) {
    return explicit
  }

  const issuer = process.env.OBJ12_OIDC_ISSUER?.trim()
  if (!issuer) {
    return null
  }

  return `${issuer.replace(/\/+$/, '')}/protocol/openid-connect/certs`
}

function issueSessionToken(claims: Obj12SessionClaims): string {
  const encodedPayload = encodeBase64Url(JSON.stringify(claims))
  const signature = createSignature(encodedPayload).toString('base64url')
  return `obj12.${encodedPayload}.${signature}`
}

function verifySessionToken(token: string): Obj12VerifyResult {
  const parts = token.trim().split('.')
  if (parts.length !== 3 || parts[0] !== 'obj12') {
    return {
      ok: false,
      code: 'INVALID_TOKEN',
      message: 'Session-Token hat kein gueltiges Format.',
    }
  }

  const [, encodedPayload, encodedSignature] = parts
  const providedSignature = Buffer.from(encodedSignature, 'base64url')
  let expectedSignature: Buffer
  try {
    expectedSignature = createSignature(encodedPayload)
  } catch (error) {
    return {
      ok: false,
      code: 'AUTH_CONFIGURATION_ERROR',
      message:
        error instanceof Error
          ? error.message
          : 'Authentifizierung ist derzeit nicht korrekt konfiguriert.',
    }
  }
  if (
    providedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(providedSignature, expectedSignature)
  ) {
    return {
      ok: false,
      code: 'INVALID_TOKEN',
      message: 'Session-Token Signatur ist ungueltig.',
    }
  }

  let parsedPayload: unknown
  try {
    parsedPayload = JSON.parse(decodeBase64Url(encodedPayload))
  } catch {
    return {
      ok: false,
      code: 'INVALID_TOKEN',
      message: 'Session-Token Payload ist ungueltig.',
    }
  }

  const sessionSchema = z.object({
    version: z.literal(1),
    sessionId: z.string().min(1),
    subject: z.string().min(1),
    username: z.string().min(1),
    displayName: z.string().min(1),
    email: z.string().email().nullable(),
    role: z.enum(['viewer', 'operator', 'admin']),
    provider: z.enum(['local', 'oidc']),
    issuedAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
  })

  const parsedSession = sessionSchema.safeParse(parsedPayload)
  if (!parsedSession.success) {
    return {
      ok: false,
      code: 'INVALID_TOKEN',
      message: 'Session-Token Inhalt ist ungueltig.',
    }
  }

  const expiresAtMs = Date.parse(parsedSession.data.expiresAt)
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
    return {
      ok: false,
      code: 'EXPIRED_TOKEN',
      message: 'Session-Token ist abgelaufen.',
    }
  }

  return {
    ok: true,
    session: parsedSession.data,
  }
}

function cleanupRevokedSessionTokens(now = Date.now()): void {
  for (const [token, expiresAt] of revokedSessionTokens.entries()) {
    if (expiresAt <= now) {
      revokedSessionTokens.delete(token)
    }
  }
}

function isSessionTokenRevoked(token: string): boolean {
  cleanupRevokedSessionTokens()
  const expiresAt = revokedSessionTokens.get(token)
  return typeof expiresAt === 'number' && expiresAt > Date.now()
}

function revokeSessionToken(token: string, expiresAtIso: string): void {
  const expiresAt = Date.parse(expiresAtIso)
  if (!Number.isFinite(expiresAt)) {
    return
  }

  cleanupRevokedSessionTokens()
  revokedSessionTokens.set(token, expiresAt)
}

function hashEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

function verifyConfiguredPassword(user: Obj12ConfiguredLocalUser, password: string): boolean {
  if (user.passwordHash?.startsWith('scrypt$')) {
    const [, salt, expectedHash] = user.passwordHash.split('$')
    if (!salt || !expectedHash) {
      return false
    }

    const derived = scryptSync(password, salt, 32).toString('base64url')
    return hashEquals(derived, expectedHash)
  }

  if (user.password) {
    return hashEquals(password, user.password)
  }

  return false
}

function buildSessionClaims(input: {
  subject: string
  username: string
  displayName: string
  email?: string | null
  role: Obj12Role
  provider: Obj12AuthProvider
}): Obj12SessionClaims {
  const issuedAt = new Date()
  const expiresAt = new Date(issuedAt.getTime() + getSessionTtlSeconds() * 1000)

  return {
    version: 1,
    sessionId: randomUUID(),
    subject: input.subject,
    username: input.username,
    displayName: input.displayName,
    email: input.email ?? null,
    role: input.role,
    provider: input.provider,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }
}

function extractAudience(claims: Obj12JwtLikeClaims): string[] {
  if (Array.isArray(claims.aud)) {
    return claims.aud
  }
  if (typeof claims.aud === 'string' && claims.aud.trim()) {
    return [claims.aud]
  }
  return []
}

function validateOidcClaims(claims: Obj12JwtLikeClaims): void {
  const expectedIssuer = process.env.OBJ12_OIDC_ISSUER?.trim()
  if (expectedIssuer && claims.iss !== expectedIssuer) {
    throw new Error('OIDC-Issuer stimmt nicht mit der Konfiguration ueberein.')
  }

  const expectedAudience = process.env.OBJ12_OIDC_AUDIENCE?.trim()
  if (expectedAudience && !extractAudience(claims).includes(expectedAudience)) {
    throw new Error('OIDC-Audience stimmt nicht mit der Konfiguration ueberein.')
  }
}

function extractRoleFromOidcClaims(claims: Obj12JwtLikeClaims): Obj12Role {
  const candidates = new Set<string>()

  if (typeof claims.role === 'string') {
    candidates.add(claims.role)
  }
  for (const role of claims.roles ?? []) {
    candidates.add(role)
  }
  for (const role of claims.realm_access?.roles ?? []) {
    candidates.add(role)
  }
  for (const resource of Object.values(claims.resource_access ?? {})) {
    for (const role of resource.roles ?? []) {
      candidates.add(role)
    }
  }
  for (const group of claims.groups ?? []) {
    candidates.add(group)
  }

  const mappedRoles = Array.from(candidates)
    .map((value) => normalizeRole(value))
    .filter((value): value is Obj12Role => value !== null)
    .sort((left, right) => ROLE_ORDER[right] - ROLE_ORDER[left])

  return mappedRoles[0] ?? 'viewer'
}

function decodeJwtPayload(token: string): Obj12JwtLikeClaims {
  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    throw new Error('OIDC-Token ist kein JWT im erwarteten Format.')
  }

  let payload: Obj12JwtLikeClaims
  try {
    payload = JSON.parse(decodeBase64Url(parts[1])) as Obj12JwtLikeClaims
  } catch {
    throw new Error('OIDC-Token enthaelt kein gueltiges JSON-Payload.')
  }

  return payload
}

function parseJwtHeader(token: string): Obj12JwtHeader {
  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    throw new Error('OIDC-Token ist kein JWT im erwarteten Format.')
  }

  try {
    return JSON.parse(decodeBase64Url(parts[0])) as Obj12JwtHeader
  } catch {
    throw new Error('OIDC-Token enthaelt keinen gueltigen Header.')
  }
}

async function loadOidcJwks(url: string): Promise<Obj12RsaJwk[]> {
  const now = Date.now()
  if (oidcJwksCache && oidcJwksCache.url === url && oidcJwksCache.expiresAt > now) {
    return oidcJwksCache.keys
  }

  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(
      `OIDC-JWKS konnten nicht geladen werden (HTTP ${response.status}).`,
    )
  }

  const payload = (await response.json()) as { keys?: unknown[] }
  if (!Array.isArray(payload.keys)) {
    throw new Error('OIDC-JWKS Antwort enthaelt keine gueltige Schluesselliste.')
  }

  const keys = payload.keys.filter((entry): entry is Obj12RsaJwk => {
    if (!entry || typeof entry !== 'object') {
      return false
    }

    const candidate = entry as Obj12RsaJwk
    return (
      typeof candidate.kid === 'string' &&
      candidate.kid.trim().length > 0 &&
      candidate.kty === 'RSA' &&
      typeof candidate.n === 'string' &&
      candidate.n.trim().length > 0 &&
      typeof candidate.e === 'string' &&
      candidate.e.trim().length > 0
    )
  })

  oidcJwksCache = {
    url,
    expiresAt: now + OIDC_JWKS_CACHE_TTL_MS,
    keys,
  }

  return keys
}

async function verifyOidcTokenSignature(token: string): Promise<void> {
  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    throw new Error('OIDC-Token ist kein JWT im erwarteten Format.')
  }

  const header = parseJwtHeader(token)
  if (header.alg !== 'RS256') {
    throw new Error(
      `OIDC-Token Signaturalgorithmus "${header.alg ?? 'unknown'}" wird nicht unterstuetzt (erwartet RS256).`,
    )
  }

  const jwksUrl = getOidcJwksUrl()
  if (!jwksUrl) {
    throw new Error(
      'OIDC-Konfiguration unvollstaendig: OBJ12_OIDC_ISSUER oder OBJ12_OIDC_JWKS_URL fehlt fuer Signaturpruefung.',
    )
  }

  if (!header.kid?.trim()) {
    throw new Error('OIDC-Token Header enthaelt kein kid fuer Schluesselauflösung.')
  }

  const keys = await loadOidcJwks(jwksUrl)
  const key = keys.find((entry) => entry.kid === header.kid)
  if (!key) {
    throw new Error(
      `OIDC-JWKS enthaelt keinen passenden Schluessel fuer kid "${header.kid}".`,
    )
  }

  const keyObject = createPublicKey({
    key: key as unknown as import('node:crypto').JsonWebKey,
    format: 'jwk',
  })
  const signingInput = Buffer.from(`${parts[0]}.${parts[1]}`, 'utf8')
  const signature = Buffer.from(parts[2], 'base64url')
  const isValid = verifySignature('RSA-SHA256', signingInput, keyObject, signature)
  if (!isValid) {
    throw new Error('OIDC-Token Signatur ist ungueltig.')
  }
}

function readBearerToken(request: Request): string | null {
  const authorization = request.headers.get('authorization')?.trim()
  if (!authorization) {
    return null
  }

  const [scheme, token] = authorization.split(/\s+/, 2)
  if (scheme?.toLowerCase() !== 'bearer' || !token?.trim()) {
    return null
  }

  return token.trim()
}

function buildAuthErrorResponse(
  status: 401 | 403 | 503,
  code: string,
  message: string,
  requiredRole: Obj12Role,
): NextResponse<ApiResponseShape<null>> {
  return apiError(status, {
    code,
    message,
    details: {
      requiredRole,
    },
  })
}

async function emitAuthSecurityEvent(input: {
  name: string
  request: Request
  severity?: 'INFO' | 'WARN' | 'ERROR'
  outcome?: 'success' | 'failure' | 'blocked'
  statusCode?: number
  attributes?: Record<string, string | number | boolean | null | undefined>
}): Promise<void> {
  const pathname = new URL(input.request.url).pathname

  await emitSecuritySignal({
    name: input.name,
    route: pathname,
    operation: 'auth',
    requestId: createObservabilityRequestId(),
    severity: input.severity,
    outcome: input.outcome,
    statusCode: input.statusCode,
    attributes: {
      'auth.mode': getAuthMode(),
      ...input.attributes,
    },
  })
}

export async function authenticateLocalUser(input: {
  username: string
  password: string
  request: Request
}): Promise<{
  session: Obj12SessionClaims
  accessToken: string
}> {
  if (!isLocalModeEnabled()) {
    await emitAuthSecurityEvent({
      name: 'dns.auth.local.disabled',
      request: input.request,
      severity: 'WARN',
      outcome: 'blocked',
      statusCode: 403,
    })
    throw new Error('Lokale Authentifizierung ist in diesem Modus deaktiviert.')
  }

  const users = getConfiguredLocalUsers()
  const user =
    users.find(
      (entry) => entry.username.toLowerCase() === input.username.trim().toLowerCase(),
    ) ?? null

  if (!user || !verifyConfiguredPassword(user, input.password)) {
    await emitAuthSecurityEvent({
      name: 'dns.auth.local.failed',
      request: input.request,
      severity: 'WARN',
      outcome: 'blocked',
      statusCode: 401,
      attributes: {
        'auth.username': input.username,
      },
    })
    throw new Error('Benutzername oder Passwort ist ungueltig.')
  }

  const session = buildSessionClaims({
    subject: `local:${user.username}`,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    provider: 'local',
  })

  await emitAuthSecurityEvent({
    name: 'dns.auth.local.succeeded',
    request: input.request,
    severity: 'INFO',
    outcome: 'success',
    statusCode: 200,
    attributes: {
      'auth.username': session.username,
      'auth.role': session.role,
      'auth.provider': session.provider,
    },
  })

  return {
    session,
    accessToken: issueSessionToken(session),
  }
}

export async function authenticateOidcToken(input: {
  token: string
  request: Request
}): Promise<{
  session: Obj12SessionClaims
  accessToken: string
}> {
  if (!isOidcModeEnabled()) {
    await emitAuthSecurityEvent({
      name: 'dns.auth.oidc.disabled',
      request: input.request,
      severity: 'WARN',
      outcome: 'blocked',
      statusCode: 403,
    })
    throw new Error('OIDC-Authentifizierung ist in diesem Modus deaktiviert.')
  }

  if (allowUnsignedOidcTokenExchange()) {
    await emitAuthSecurityEvent({
      name: 'dns.auth.oidc.signature.dev_override',
      request: input.request,
      severity: 'WARN',
      outcome: 'success',
      statusCode: 200,
      attributes: {
        'auth.warning':
          'OIDC-Signaturpruefung ist per Konfiguration deaktiviert (nur fuer lokale/test Umgebungen).',
      },
    })
  } else {
    try {
      await verifyOidcTokenSignature(input.token)
    } catch (error) {
      await emitAuthSecurityEvent({
        name: 'dns.auth.oidc.signature.failed',
        request: input.request,
        severity: 'WARN',
        outcome: 'blocked',
        statusCode: 401,
        attributes: {
          'auth.error':
            error instanceof Error ? error.message : 'signature-validation-failed',
        },
      })

      throw error instanceof Error
        ? error
        : new Error('OIDC-Token Signaturpruefung fehlgeschlagen.')
    }
  }

  const claims = decodeJwtPayload(input.token)
  validateOidcClaims(claims)

  const username =
    claims.preferred_username?.trim() ||
    claims.email?.trim() ||
    claims.sub?.trim()
  if (!username) {
    await emitAuthSecurityEvent({
      name: 'dns.auth.oidc.invalid_claims',
      request: input.request,
      severity: 'WARN',
      outcome: 'blocked',
      statusCode: 401,
    })
    throw new Error('OIDC-Token enthaelt keine verwertbare Benutzerkennung.')
  }

  const session = buildSessionClaims({
    subject: claims.sub?.trim() || `oidc:${username}`,
    username,
    displayName: claims.name?.trim() || username,
    email: claims.email?.trim() || null,
    role: extractRoleFromOidcClaims(claims),
    provider: 'oidc',
  })

  await emitAuthSecurityEvent({
    name: 'dns.auth.oidc.succeeded',
    request: input.request,
    severity: 'INFO',
    outcome: 'success',
    statusCode: 200,
    attributes: {
      'auth.username': session.username,
      'auth.role': session.role,
      'auth.provider': session.provider,
      'auth.subject': session.subject,
    },
  })

  return {
    session,
    accessToken: issueSessionToken(session),
  }
}

export async function requireSession(
  request: Request,
  minimumRole: Obj12Role = 'viewer',
): Promise<
  | { ok: true; session: Obj12SessionClaims }
  | { ok: false; response: NextResponse<ApiResponseShape<null>> }
> {
  const token = readBearerToken(request)
  if (!token) {
    await emitAuthSecurityEvent({
      name: 'dns.auth.token.missing',
      request,
      severity: 'WARN',
      outcome: 'blocked',
      statusCode: 401,
      attributes: {
        'auth.required_role': minimumRole,
      },
    })

    return {
      ok: false,
      response: buildAuthErrorResponse(
        401,
        'AUTH_REQUIRED',
        'Authentifizierung erforderlich. Bitte Bearer-Token mitsenden.',
        minimumRole,
      ),
    }
  }

  if (isSessionTokenRevoked(token)) {
    await emitAuthSecurityEvent({
      name: 'dns.auth.token.revoked',
      request,
      severity: 'WARN',
      outcome: 'blocked',
      statusCode: 401,
      attributes: {
        'auth.required_role': minimumRole,
      },
    })

    return {
      ok: false,
      response: buildAuthErrorResponse(
        401,
        'TOKEN_REVOKED',
        'Session ist bereits abgemeldet und nicht mehr gueltig.',
        minimumRole,
      ),
    }
  }

  const verification = verifySessionToken(token)
  if (!verification.ok) {
    const isConfigurationError = verification.code === 'AUTH_CONFIGURATION_ERROR'
    const statusCode = isConfigurationError ? 503 : 401

    await emitAuthSecurityEvent({
      name: isConfigurationError
        ? 'dns.auth.configuration.error'
        : verification.code === 'EXPIRED_TOKEN'
          ? 'dns.auth.token.expired'
          : 'dns.auth.token.invalid',
      request,
      severity: isConfigurationError ? 'ERROR' : 'WARN',
      outcome: isConfigurationError ? 'failure' : 'blocked',
      statusCode,
      attributes: {
        'auth.required_role': minimumRole,
      },
    })

    return {
      ok: false,
      response: buildAuthErrorResponse(
        statusCode,
        verification.code,
        verification.message,
        minimumRole,
      ),
    }
  }

  if (ROLE_ORDER[verification.session.role] < ROLE_ORDER[minimumRole]) {
    await emitAuthSecurityEvent({
      name: 'dns.auth.role.forbidden',
      request,
      severity: 'WARN',
      outcome: 'blocked',
      statusCode: 403,
      attributes: {
        'auth.required_role': minimumRole,
        'auth.actual_role': verification.session.role,
        'auth.username': verification.session.username,
      },
    })

    return {
      ok: false,
      response: buildAuthErrorResponse(
        403,
        'FORBIDDEN',
        `Rolle "${minimumRole}" oder hoeher ist erforderlich.`,
        minimumRole,
      ),
    }
  }

  return {
    ok: true,
    session: verification.session,
  }
}

export async function logoutSession(request: Request): Promise<void> {
  const token = readBearerToken(request)
  const verification = token ? verifySessionToken(token) : null

  if (token && verification?.ok) {
    revokeSessionToken(token, verification.session.expiresAt)
  }

  await emitAuthSecurityEvent({
    name: 'dns.auth.session.logout',
    request,
    severity: 'INFO',
    outcome: 'success',
    statusCode: 200,
    attributes: {
      'auth.username': verification?.ok ? verification.session.username : 'unknown',
      'auth.provider': verification?.ok ? verification.session.provider : 'unknown',
      'auth.token_revoked': Boolean(token && verification?.ok),
    },
  })
}

export function getPublicAuthConfiguration() {
  const users = getConfiguredLocalUsers()
  return {
    mode: getAuthMode(),
    ttlSeconds: getSessionTtlSeconds(),
    providers: {
      local: isLocalModeEnabled(),
      oidc: isOidcModeEnabled(),
    },
    oidcUnsignedTokenExchangeAllowed: allowUnsignedOidcTokenExchange(),
    oidcJwksConfigured: Boolean(getOidcJwksUrl()),
    localFallbackConfigured: users.length > 0,
    oidcIssuerConfigured: Boolean(process.env.OBJ12_OIDC_ISSUER?.trim()),
    localUsers: users.map((user) => ({
      username: user.username,
      role: user.role,
      displayName: user.displayName,
    })),
  }
}

export const obj12LoginSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('local'),
    username: z.string().trim().min(1),
    password: z.string().min(1),
  }),
  z.object({
    mode: z.literal('oidc'),
    token: z.string().trim().min(1),
  }),
])
