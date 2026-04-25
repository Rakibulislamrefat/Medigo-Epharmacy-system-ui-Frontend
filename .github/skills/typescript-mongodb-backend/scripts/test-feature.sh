#!/bin/bash
# Test a specific feature or file

if [ -z "$1" ]; then
  echo "Usage: ./test-feature.sh <feature-name>"
  echo "Example: ./test-feature.sh login"
  echo "         ./test-feature.sh bloodBank"
  exit 1
fi

FEATURE=$1

echo "🧪 Testing feature: $FEATURE"
echo ""

# Run tests matching the feature name
npm test -- --testPathPattern="$FEATURE" --verbose

echo ""
echo "✅ Tests completed for: $FEATURE"
