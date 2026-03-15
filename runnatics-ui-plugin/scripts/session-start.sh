#!/usr/bin/env bash
# session-start.sh — Initialize a Runnatics.Ui development session
# Verifies environment health and loads project context for Claude Code.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
UI_DIR="$PROJECT_ROOT/Runnatics.Ui"
CONTEXT_FILE="$PROJECT_ROOT/.claude/CONTEXT.md"

echo "=========================================="
echo "  Runnatics.Ui — Session Start"
echo "=========================================="
echo ""

# 1. Check Node.js
echo "--- Environment ---"
echo "Node.js: $(node --version 2>/dev/null || echo 'NOT FOUND')"
echo "npm:     $(npm --version 2>/dev/null || echo 'NOT FOUND')"
echo "Git:     $(git --version 2>/dev/null || echo 'NOT FOUND')"
echo "Branch:  $(git -C "$PROJECT_ROOT" branch --show-current 2>/dev/null || echo 'unknown')"
echo ""

# 2. Check if node_modules exist
if [[ -d "$UI_DIR/node_modules" ]]; then
  echo "[OK] node_modules present"
else
  echo "[WARN] node_modules missing — run 'npm install' in Runnatics.Ui/"
fi
echo ""

# 3. TypeScript health check
echo "--- TypeScript Health ---"
cd "$UI_DIR"
if npx tsc --noEmit --pretty 2>&1 | tail -5; then
  echo "[OK] TypeScript compiles cleanly"
else
  echo "[WARN] TypeScript errors detected — review before starting work"
fi
echo ""

# 4. Check Vite dev server
echo "--- Dev Server (port 5173) ---"
if command -v curl &>/dev/null; then
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ 2>/dev/null | grep -q "200\|304"; then
    echo "[OK] Vite dev server is running on http://localhost:5173"
  else
    echo "[INFO] Vite dev server not running. Start with: cd Runnatics.Ui && npm run dev"
  fi
elif command -v powershell &>/dev/null; then
  if powershell -Command "try { (Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing -TimeoutSec 2).StatusCode } catch { 0 }" 2>/dev/null | grep -q "200"; then
    echo "[OK] Vite dev server is running on http://localhost:5173"
  else
    echo "[INFO] Vite dev server not running. Start with: cd Runnatics.Ui && npm run dev"
  fi
else
  echo "[SKIP] Cannot check dev server (no curl available)"
fi
echo ""

# 5. Check backend API
echo "--- Backend API (port 5286) ---"
if command -v curl &>/dev/null; then
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:5286/api/ 2>/dev/null | grep -qE "200|401|404"; then
    echo "[OK] Backend API responding on http://localhost:5286"
  else
    echo "[INFO] Backend API not running. Start the .NET backend project separately."
  fi
else
  echo "[SKIP] Cannot check backend (no curl available)"
fi
echo ""

# 6. Load shared context
echo "--- Shared Context ---"
if [[ -f "$CONTEXT_FILE" ]]; then
  echo "[OK] CONTEXT.md found at $CONTEXT_FILE"
  echo ""
  echo "Recent session log entries:"
  grep -A 2 "^### " "$CONTEXT_FILE" 2>/dev/null | tail -15 || echo "  (no session log entries yet)"
else
  echo "[INFO] CONTEXT.md not found — it will be created on first task completion"
fi
echo ""

# 7. Quick stats
echo "--- Project Stats ---"
TS_FILES=$(find "$UI_DIR/src" -name '*.ts' -o -name '*.tsx' 2>/dev/null | grep -v node_modules | wc -l || echo "?")
SERVICE_FILES=$(find "$UI_DIR/src" -path '*/services/*.ts' 2>/dev/null | grep -v node_modules | wc -l || echo "?")
MODEL_FILES=$(find "$UI_DIR/src" -path '*/models/*.ts' 2>/dev/null | grep -v node_modules | wc -l || echo "?")
echo "TypeScript files: $TS_FILES"
echo "Service files:    $SERVICE_FILES"
echo "Model files:      $MODEL_FILES"
echo ""

echo "=========================================="
echo "  Session ready. Read CONTEXT.md first!"
echo "=========================================="
