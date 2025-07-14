#!/bin/bash

API_URL="http://127.0.0.1:8000"
declare -A TOKENS

# Users and passwords
declare -A USERS=(
  ["admin"]="admin@agrilink.com"
  ["farmer"]="farmer@agrilink.com"
  ["consumer"]="consumer@agrilink.com"
  ["retailer"]="retailer@agrilink.com"
  ["logistics"]="logistics@agrilink.com"
)

PASSWORD="password123"

# Login and store tokens
function login_users() {
  echo "🔐 Logging in all users..."
  for role in "${!USERS[@]}"; do
    email=${USERS[$role]}
    response=$(curl -s -X POST "$API_URL/api/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\": \"$email\", \"password\": \"$PASSWORD\"}")
    token=$(echo $response | grep -oP '"token"\s*:\s*"\K[^"]+')
    TOKENS[$role]=$token
    echo "$role logged in."
  done
}

# Menu
function menu() {
  echo ""
  echo "📋 What do you want to test?"
  echo "1) Get Authenticated User"
  echo "2) List Products (Public)"
  echo "3) Create Product (Farmer Only)"
  echo "4) Place Order (Consumer)"
  echo "5) Assign Delivery (Logistics)"
  echo "6) Get Admin Analytics"
  echo "7) Exit"
  echo ""
  read -p "Choose an option (1-7): " choice
  echo ""

  case $choice in
    1)
      echo "👤 Authenticated user (admin)..."
      curl -s -X GET "$API_URL/api/user" \
        -H "Authorization: Bearer ${TOKENS[admin]}"
      ;;
    2)
      echo "🛒 Public product list..."
      curl -s -X GET "$API_URL/api/products"
      ;;
    3)
      echo "🌽 Creating product (farmer)..."
      curl -s -X POST "$API_URL/api/products" \
        -H "Authorization: Bearer ${TOKENS[farmer]}" \
        -H "Content-Type: application/json" \
        -d '{
              "name": "Organic Tomatoes",
              "description": "Fresh red tomatoes",
              "price": 30,
              "category": "vegetables",
              "status": "active"
            }'
      ;;
    4)
      echo "🛒 Placing order (consumer)..."
      curl -s -X POST "$API_URL/api/orders" \
        -H "Authorization: Bearer ${TOKENS[consumer]}" \
        -H "Content-Type: application/json" \
        -d '{
              "items": [
                { "product_id": 1, "quantity": 2 }
              ],
              "payment_method": "credit_card"
            }'
      ;;
    5)
      echo "🚚 Assigning delivery (logistics)..."
      curl -s -X POST "$API_URL/api/deliveries/1/assign" \
        -H "Authorization: Bearer ${TOKENS[logistics]}"
      ;;
    6)
      echo "📊 Getting admin analytics..."
      curl -s -X GET "$API_URL/api/admin/analytics" \
        -H "Authorization: Bearer ${TOKENS[admin]}"
      ;;
    7)
      echo "👋 Exiting."
      exit 0
      ;;
    *)
      echo "❌ Invalid option."
      ;;
  esac

  echo -e "\n--- Done ---"
  menu
}

# Run script
login_users
menu

