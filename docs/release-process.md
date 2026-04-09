# Release-Prozess

Diese Seite beschreibt den Weg von der Aenderung bis zur Uebergabe.
Sie ist die einfache Betriebsanleitung fuer Release, Export und Freigabe.

## Grundidee

Ein Release ist erst fertig, wenn die technischen Artefakte, die Security-Nachweise und die Doku zusammenpassen.

## Pflichtartefakte

- Git-Tag und Release-Notizen
- CHANGELOG
- SBOM
- Zarf-Paket
- Security-Bericht
- Checksummen
- aktuelle Dokumentation
- versionierte Update-Hinweise

## Ablauf

1. Aenderungen mergen.
2. Release-Version festlegen.
3. Tag im SemVer-Format setzen.
4. Pipeline laeuft mit Build, Tests und Security-Pruefungen.
5. SBOM und Security-Bericht erzeugen.
6. Zarf-Paket bauen.
7. Artefaktinhalt pruefen.
8. GitLab Release bzw. Release-Artefakt freigeben.
9. Doku-Version und E-Book-Export anlegen.
10. Export in die Zielumgebung vorbereiten.
11. Ergebnis im Export-Log dokumentieren.

## Dokumentation pro Release

Pro Release sollen drei Doku-Staende vorhanden sein:

- die aktuelle Version
- die vorherige Version
- eine lesbare Aenderungsuebersicht

So bleibt die Versionsumschaltung in der Website nachvollziehbar.
Die technische Basis ist `mkdocs.yml`; lokal pruefbar ist die Website mit:

```bash
mkdocs build
```

Fuer die Publikation eignet sich `mike`.

## E-Book-Export

Fuer jede freigegebene Version wird zusaetzlich ein E-Book-Export erzeugt.
Dieser Export soll:

- ein Inhaltsverzeichnis enthalten
- die Release-Version sichtbar machen
- versioniert abgelegt werden

## Uebergabe an Zielumgebungen

1. Release-Artefakte exportieren.
2. Zarf-Paket transferieren.
3. Release-Projekt und Konfigurationsprojekt in Gitea bereitstellen.
4. Argo CD synchronisieren.
5. Smoke-Test ausfuehren.
6. Ergebnis und Dateiverweis im Export-Log festhalten.

## Was bei Fehlern gilt

- Fehlende SBOM blockiert das Release.
- Fehlender Security-Bericht blockiert die Uebergabe.
- Unvollstaendiges Zarf-Paket blockiert den Export.
- Nicht aktuelle Doku blockiert den Abschluss.

## Weiter lesen

- [Zarf-Paket](zarf.md)
- [Offline-Installation](offline-install.md)
- [Argo CD](argocd.md)
- [Benutzerhandbuch](user-manual/README.md)
