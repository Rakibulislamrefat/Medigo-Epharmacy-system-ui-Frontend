#!/bin/bash
# Quick lint and fix common issues

echo "🔧 Auto-fixing linting issues..."
npx eslint src --ext .ts,.tsx --fix

echo "✅ ESLint auto-fix completed"
echo ""
echo "Run: npm test"
echo "To verify changes still pass tests"
