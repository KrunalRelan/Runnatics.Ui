#!/usr/bin/env bash
# format-frontend.sh — Format and lint the Runnatics.Ui frontend codebase
# Usage: bash runnatics-ui-plugin/scripts/format-frontend.sh [--check]

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/../../Runnatics.Ui" && pwd)"
CHECK_ONLY=false

if [[ "${1:-}" == "--check" ]]; then
  CHECK_ONLY=true
fi

echo "=== Runnatics.Ui Frontend Format & Lint ==="
echo "Project: $PROJECT_DIR"
echo ""

cd "$PROJECT_DIR"

# 1. TypeScript type-check (always runs, never modifies files)
echo "--- TypeScript type-check ---"
if npx tsc --noEmit 2>&1; then
  echo "[PASS] No TypeScript errors"
else
  echo "[FAIL] TypeScript errors found — fix before proceeding"
  exit 1
fi
echo ""

# 2. ESLint
echo "--- ESLint ---"
if [[ "$CHECK_ONLY" == true ]]; then
  npx eslint src/ --ext .ts,.tsx --max-warnings 0
  echo "[PASS] No lint errors"
else
  npx eslint src/ --ext .ts,.tsx --max-warnings 0 --fix
  echo "[DONE] Lint fixes applied"
fi
echo ""

# 3. Prettier (if available)
if command -v npx &>/dev/null && npx prettier --version &>/dev/null 2>&1; then
  echo "--- Prettier ---"
  if [[ "$CHECK_ONLY" == true ]]; then
    npx prettier --check "src/**/*.{ts,tsx,css,json}" || {
      echo "[WARN] Formatting issues found — run without --check to fix"
      exit 1
    }
    echo "[PASS] All files formatted"
  else
    npx prettier --write "src/**/*.{ts,tsx,css,json}"
    echo "[DONE] Files formatted"
  fi
  echo ""
fi

# 4. Check for 'any' usage
echo "--- Checking for 'any' types ---"
ANY_COUNT=$(grep -rn '\bany\b' src/ --include='*.ts' --include='*.tsx' \
  --exclude-dir=node_modules --exclude='*.d.ts' | \
  grep -v '// eslint-disable' | \
  grep -v 'catch (err: any)' | \
  wc -l || true)

if [[ "$ANY_COUNT" -gt 0 ]]; then
  echo "[WARN] Found $ANY_COUNT potential 'any' usages:"
  grep -rn '\bany\b' src/ --include='*.ts' --include='*.tsx' \
    --exclude-dir=node_modules --exclude='*.d.ts' | \
    grep -v '// eslint-disable' | \
    grep -v 'catch (err: any)' | \
    head -20
  echo ""
  echo "  Replace 'any' with proper types. All IDs must be 'string' (encrypted)."
else
  echo "[PASS] No 'any' types found"
fi
echo ""

# 5. Check for direct API calls in components
echo "--- Checking for direct API calls in components ---"
DIRECT_API=$(grep -rn 'axios\.\|fetch(' src/ --include='*.tsx' \
  --exclude-dir=node_modules --exclude-dir=services --exclude-dir=utils | \
  wc -l || true)

if [[ "$DIRECT_API" -gt 0 ]]; then
  echo "[WARN] Found $DIRECT_API direct API calls in .tsx files:"
  grep -rn 'axios\.\|fetch(' src/ --include='*.tsx' \
    --exclude-dir=node_modules --exclude-dir=services --exclude-dir=utils | \
    head -10
  echo ""
  echo "  Move API calls to src/main/src/services/ layer."
else
  echo "[PASS] No direct API calls in components"
fi
echo ""

echo "=== Format complete ==="
