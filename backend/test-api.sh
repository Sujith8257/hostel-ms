#!/bin/bash

echo "🧪 Testing Hostel Management Backend API Endpoints"
echo "=================================================="

BASE_URL="http://localhost:3001"

echo "1. Testing Health Endpoint..."
curl -s "$BASE_URL/health" | jq '.' || echo "Health endpoint failed"
echo ""

echo "2. Testing Admin Dashboard (should require auth)..."
curl -s "$BASE_URL/api/admin/dashboard" | jq '.' || echo "Expected auth error"
echo ""

echo "3. Testing Director Dashboard (should require auth)..."
curl -s "$BASE_URL/api/director/dashboard" | jq '.' || echo "Expected auth error"
echo ""

echo "4. Testing Warden Dashboard (should require auth)..."
curl -s "$BASE_URL/api/warden/dashboard" | jq '.' || echo "Expected auth error"
echo ""

echo "5. Testing Associate Warden Dashboard (should require auth)..."
curl -s "$BASE_URL/api/associate-warden/dashboard" | jq '.' || echo "Expected auth error"
echo ""

echo "6. Testing Caretaker Dashboard (should require auth)..."
curl -s "$BASE_URL/api/caretaker/dashboard" | jq '.' || echo "Expected auth error"
echo ""

echo "✅ API Endpoint Tests Complete!"
echo "Note: Auth errors are expected for protected endpoints without tokens"