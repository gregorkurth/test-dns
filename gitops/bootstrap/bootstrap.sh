#!/bin/sh

set -eu

MODE="${1:-}"
ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_file() {
  if [ ! -f "$ROOT_DIR/$1" ]; then
    echo "Missing required file: $1" >&2
    exit 1
  fi
}

require_command kubectl
require_command argocd
require_file gitops/argocd/root-application.yaml
require_file gitops/argocd/bootstrap-resources/appproject.yaml
require_file gitops/argocd/bootstrap-resources/applicationset.yaml

echo "Checking offline GitOps prerequisites..."
kubectl get namespace argocd >/dev/null
kubectl auth can-i create applications.argoproj.io -n argocd >/dev/null
kubectl auth can-i create appprojects.argoproj.io -n argocd >/dev/null

if [ "$MODE" = "--check-only" ]; then
  echo "All required files and permissions are present."
  exit 0
fi

echo "Applying AppProject..."
kubectl apply -f "$ROOT_DIR/gitops/argocd/bootstrap-resources/appproject.yaml"

echo "Applying Root Application..."
kubectl apply -f "$ROOT_DIR/gitops/argocd/root-application.yaml"

cat <<'EOF'
Bootstrap finished.
Next steps:
  1. argocd app sync dns-management-root --grpc-web
  2. argocd app wait dns-management-root --health --sync --grpc-web
  3. curl -s http://localhost:3000/api/v1/gitops
EOF
