# AgriLink Frontend-Backend Integration Documentation

## Overview
This document explains how the AgriLink frontend (HTML/CSS/JavaScript) integrates with the Laravel backend API.

## API Configuration
- **Base URL**: `http://127.0.0.1:8000/api`
- **Config File**: `scripts/config.js`
- **Authentication**: Bearer token stored in localStorage

## Authentication Flow
1. User logs in via `scripts/auth.js`
2. API returns user data + JWT token
3. Token stored in localStorage as `currentUser`
4. Token included in all subsequent API calls

## File-to-Endpoint Mapping

### Authentication (`scripts/auth.js`)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Farmer Dashboard (`scripts/farmer-dashboard.js`)
- `GET /api/products` - Load farmer's products
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Consumer Dashboard (`scripts/consumer-dashboard.js`)
- `GET /api/products` - Browse all products
- `GET /api/orders` - View order history
- `POST /api/orders` - Place new order

### Retailer Dashboard (`scripts/retailer-dashboard.js`)
- `GET /api/orders` - View bulk orders
- `POST /api/orders` - Place bulk order

### Logistics Dashboard (`scripts/logistics-dashboard.js`)
- `GET /api/deliveries` - Load deliveries
- `PUT /api/deliveries/{id}/status` - Update delivery status

### Admin Dashboard (`scripts/admin-dashboard.js`)
- `GET /api/admin/users` - Load all users
- `POST /api/admin/users/{id}/toggle-status` - Toggle user status
- `GET /api/admin/analytics` - Get analytics data

### Analytics (`scripts/analytics.js`)
- `GET /api/admin/analytics` - Load analytics data

## Token Management
- **Storage**: `localStorage.getItem('currentUser')`
- **Format**: `{ ...user, token: 'jwt_token', loginTime: 'iso_date' }`
- **Usage**: `Authorization: Bearer {token}` header

## API Client Usage
```javascript
// Initialize (automatic via config.js)
const apiClient = new ApiClient();

// Make authenticated requests
const response = await apiClient.getProducts();
const newProduct = await apiClient.createProduct(productData);
```

## Error Handling
- All API calls wrapped in try-catch
- User-friendly error messages via alerts
- Fallback to demo data where applicable
- Console logging for debugging

## Development Notes
- API client auto-loads via script injection
- All forms show loading states during API calls
- Token automatically included in requests
- Logout clears localStorage and redirects
- Role-based routing implemented

## Testing Locally
1. Start Laravel backend: `php artisan serve`
2. Ensure CORS is configured for frontend domain
3. Open any HTML file in browser
4. Use seeded accounts for testing

## Future Enhancements
- Implement proper error toasts
- Add request/response interceptors
- Implement token refresh logic
- Add offline mode support