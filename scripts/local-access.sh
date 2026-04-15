#!/usr/bin/env bash
# local-access.sh – Startet Port-Forwards fuer den lokalen Kubernetes-Cluster
# Verwendung: ./scripts/local-access.sh [start|stop|status]

set -euo pipefail

NAMESPACE="dns-management-local"
APP_LOCAL_PORT=8080
DOCS_LOCAL_PORT=8081
PID_FILE="/tmp/dns-local-pf.pids"

app_pod() {
  kubectl get pod -n "$NAMESPACE" \
    -l app.kubernetes.io/name=dns-management-service \
    -l app.kubernetes.io/component!=docs \
    -o jsonpath='{.items[0].metadata.name}' 2>/dev/null
}

docs_pod() {
  kubectl get pod -n "$NAMESPACE" \
    -l app.kubernetes.io/name=dns-management-service \
    -l app.kubernetes.io/component=docs \
    -o jsonpath='{.items[0].metadata.name}' 2>/dev/null
}

start() {
  if [[ -f "$PID_FILE" ]]; then
    echo "Port-Forwards laufen bereits (PID-Datei gefunden). Zuerst 'stop' ausfuehren."
    exit 1
  fi

  echo "Starte Port-Forwards..."

  APP=$(app_pod)
  DOCS=$(docs_pod)

  if [[ -z "$APP" ]]; then
    echo "FEHLER: Kein App-Pod gefunden in Namespace $NAMESPACE"
    exit 1
  fi
  if [[ -z "$DOCS" ]]; then
    echo "FEHLER: Kein Docs-Pod gefunden in Namespace $NAMESPACE"
    exit 1
  fi

  kubectl port-forward "pod/$APP" "${APP_LOCAL_PORT}:3000" -n "$NAMESPACE" \
    > /tmp/dns-local-pf-app.log 2>&1 &
  echo "$!" > "$PID_FILE"

  kubectl port-forward "pod/$DOCS" "${DOCS_LOCAL_PORT}:8080" -n "$NAMESPACE" \
    > /tmp/dns-local-pf-docs.log 2>&1 &
  echo "$!" >> "$PID_FILE"

  sleep 2

  echo ""
  echo "  App:    http://localhost:${APP_LOCAL_PORT}"
  echo "  Docs:   http://localhost:${DOCS_LOCAL_PORT}"
  echo "  Swagger: http://localhost:${APP_LOCAL_PORT}/api/v1/swagger"
  echo ""
  echo "Beenden mit: ./scripts/local-access.sh stop"
}

stop() {
  if [[ ! -f "$PID_FILE" ]]; then
    echo "Keine laufenden Port-Forwards gefunden."
    return
  fi

  while read -r pid; do
    kill "$pid" 2>/dev/null && echo "PID $pid beendet" || echo "PID $pid bereits beendet"
  done < "$PID_FILE"

  rm -f "$PID_FILE"
  echo "Port-Forwards gestoppt."
}

status() {
  if [[ ! -f "$PID_FILE" ]]; then
    echo "Kein aktiver Port-Forward."
    return
  fi

  echo "Aktive Port-Forwards:"
  while read -r pid; do
    if kill -0 "$pid" 2>/dev/null; then
      echo "  PID $pid laeuft"
    else
      echo "  PID $pid nicht mehr aktiv"
    fi
  done < "$PID_FILE"

  echo ""
  echo "  App:    http://localhost:${APP_LOCAL_PORT}"
  echo "  Docs:   http://localhost:${DOCS_LOCAL_PORT}"
}

case "${1:-start}" in
  start)  start  ;;
  stop)   stop   ;;
  status) status ;;
  *)
    echo "Verwendung: $0 [start|stop|status]"
    exit 1
    ;;
esac
