#!/bin/bash
# API Test Script - Test if Apimart API is accessible

echo "=== Testing Apimart API ==="
echo ""

API_KEY="sk-4e8Jv0gxK3wzrsAue11bLijwWcPAF53VnDXrrRIjcwiO6vWL"
API_URL="https://api.apimart.io/v1/images/generations"

echo "Testing API endpoint: $API_URL"
echo ""

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "a beautiful sunset over ocean",
    "n": 1,
    "size": "1024x1024"
  }' \
  -v

echo ""
echo "=== Test Complete ==="
