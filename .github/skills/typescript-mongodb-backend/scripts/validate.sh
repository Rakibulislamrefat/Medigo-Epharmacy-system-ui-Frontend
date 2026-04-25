#!/bin/bash
# Comprehensive validation script for TypeScript + MongoDB backend

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 TYPESCRIPT + MONGODB BACKEND VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Phase 1: TypeScript Type Checking
echo ""
echo "1️⃣  Running TypeScript type check..."
npx tsc --noEmit || {
  echo "❌ TypeScript errors found"
  exit 1
}
echo "✅ TypeScript: OK"

# Phase 2: ESLint
echo ""
echo "2️⃣  Running ESLint..."
npx eslint src --ext .ts,.tsx --max-warnings 0 || {
  echo "❌ ESLint violations found"
  exit 1
}
echo "✅ ESLint: OK"

# Phase 3: Unit Tests
echo ""
echo "3️⃣  Running Jest tests..."
npm test -- --passWithNoTests --bail || {
  echo "❌ Jest tests failed"
  exit 1
}
echo "✅ Jest Tests: OK"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ ALL VALIDATIONS PASSED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
