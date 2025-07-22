#!/bin/bash

API_URL="http://127.0.0.1:8000/api"

# 1. Register & login users (Retailer, Logistics, Admin)
echo "🔐 Logging in users..."

RETAILER_TOKEN=$(curl -s -X POST "$API_URL/login" -H "Content-Type: application/json" -d '{"email":"retailer@example.com", "password":"password123"}' | jq -r '.token')
LOGISTICS_TOKEN=$(curl -s -X POST "$API_URL/login" -H "Content-Type: application/json" -d '{"email":"logistics@example.com", "password":"password123"}' | jq -r '.token')
ADMIN_TOKEN=$(curl -s -X POST "$API_URL/login" -H "Content-Type: application/json" -d '{"email":"admin@example.com", "password":"password123"}' | jq -r '.token')

echo "📦 Retailer Token: $RETAILER_TOKEN"
echo "🚚 Logistics Token: $LOGISTICS_TOKEN"
echo "👨‍💼 Admin Token: $ADMIN_TOKEN"

# 2. Place an order as Retailer
echo "🛒 Placing an order..."

ORDER_DATA=$(cat <<EOF
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 6000
    }
  ],
  "delivery_address": "Bulk delivery - Budget: 10000-25000. Requirements: nope",
  "delivery_date": "2025-07-23",
  "phone": "+254700000006",
  "payment_method": "cash_on_delivery",
  "total_amount": 12000,
  "notes": "Bulk order for retail - nope"
}
EOF
)

ORDER_RESPONSE=$(curl -s -X POST "$API_URL/orders" \
  -H "Authorization: Bearer $RETAILER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$ORDER_DATA")

ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.order.id')
echo "📋 Order ID: $ORDER_ID"

# 3. List orders (verify order exists)
echo "�� Verifying Retailer's Order History..."
curl -s -X GET "$API_URL/orders" -H "Authorization: Bearer $RETAILER_TOKEN" | jq .

# 4. Assign delivery (logistics/admin role)
echo "📬 Assigning delivery to Order ID: $ORDER_ID..."

curl -s -X POST "$API_URL/deliveries/$ORDER_ID/assign" \
  -H "Authorization: Bearer $LOGISTICS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"logistics_manager_id": 2}' | jq .

# 5. Update delivery status
echo "🚚 Updating delivery status to shipped..."

curl -s -X POST "$API_URL/deliveries/$ORDER_ID/status" \
  -H "Authorization: Bearer $LOGISTICS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}' | jq .

# 6. Check Admin dashboard
echo "📊 Checking Admin Order Overview..."
curl -s -X GET "$API_URL/admin/orders" -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# 7. Check Logistics deliveries
echo "📦 Checking Logistics pending deliveries..."
curl -s -X GET "$API_URL/deliveries" -H "Authorization: Bearer $LOGISTICS_TOKEN" | jq .

# 8. Final check: Retailer sees updated order
echo "✅ Final Order status check from Retailer perspective..."
curl -s -X GET "$API_URL/orders/$ORDER_ID" -H "Authorization: Bearer $RETAILER_TOKEN" | jq .

echo "✅ End-to-end test complete."

