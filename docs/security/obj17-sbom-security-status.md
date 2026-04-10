# OBJ-17 SBOM & Security Status Guide

## Zweck

Dieses Dokument beschreibt, wie Security-/SBOM-Nachweise im Repository gepflegt und fuer API/GUI bereitgestellt werden.

## Primaerquelle (Git)

- Index: `docs/releases/SECURITY-SCAN-BUNDLES.json`
- Evidenz pro Release: `artifacts/security/<version>/...` (als Pfade im Bundle hinterlegt)
- API (primaer): `/api/v1/security/scans`
- GUI (primaer): `/security-posture`

## Pflichtartefakte pro Release

1. `sbom.*` im Standardformat (SPDX oder CycloneDX)
2. `sast-*.json`
3. `sca-*.json`
4. `container-*.json`
5. `config-*.json`
6. Gate-Entscheid inkl. Owner und Verfall (in Bundle-Metadaten oder separatem Nachweis)
7. Offline-DB-Nachweis (Version + Zeitstempel)

## Offline-Fallback

Wenn die Primaerquelle fehlt oder ungueltig ist:

- API/GUI zeigen den Status als eingeschraenkt/unknown.
- Fehlende Artefakte werden explizit angezeigt.
- Der Betrieb bleibt lesbar, aber nicht release-ready.

## Validierung

```bash
npm run check:obj17
```

Der Check prueft unter anderem:

- gueltigen Bundle-Index und Versionen
- Sortierung der Releases (neueste zuerst)
- Pflichtfelder fuer SBOM/Scans/Gate/Offline
- konsistente Gate-Regel (kein `pass` mit offenen Critical Findings)
