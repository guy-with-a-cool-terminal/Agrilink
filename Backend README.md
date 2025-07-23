# AgriLink Backend API

Laravel 10 backend API for the AgriLink agricultural platform connecting farmers, consumers, retailers, logistics managers, and admins.

## Features

- **User Management**: Role-based authentication (Farmer, Consumer, Retailer, Logistics, Admin)
- **Product Management**: CRUD operations for agricultural products
- **Order Management**: Complete order lifecycle with items and tracking
- **Payment Processing**: Payment records with status tracking
- **Logistics Module**: Delivery assignment and status updates
- **Admin Dashboard**: Analytics and user management
- **Promotions**: Discount and promotion management

## Installation

1. **Clone and setup**:
```bash
cd laravel-backend
composer install
cp .env.example .env
```

2. **Configure database** in `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=agrilink
DB_USERNAME=root
DB_PASSWORD=your_password
```

3. **Generate key and run migrations**:
```bash
php artisan key:generate
php artisan migrate
php artisan db:seed
```

4. **Start development server**:
```bash
php artisan serve
```

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get authenticated user

### Products
- `GET /api/products` - List products (public)
- `POST /api/products` - Create product (farmers only)
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update product (farmers only)
- `DELETE /api/products/{id}` - Delete product (farmers only)

### Orders
- `GET /api/orders` - List user orders
- `POST /api/orders` - Place new order
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}` - Update order status (admin/logistics)
- `POST /api/orders/{id}/cancel` - Cancel order

### Deliveries
- `GET /api/deliveries` - List deliveries
- `POST /api/deliveries/{id}/assign` - Assign delivery
- `POST /api/deliveries/{id}/status` - Update delivery status
- `GET /api/deliveries/track/{tracking}` - Track delivery (public)

### Admin
- `GET /api/admin/analytics` - Dashboard analytics
- `GET /api/admin/users` - Manage users
- `PUT /api/admin/users/{id}/status` - Update user status
- `DELETE /api/admin/users/{id}` - Delete user

### Promotions
- `GET /api/promotions` - List promotions
- `POST /api/promotions` - Create promotion (admin)
- `PUT /api/promotions/{id}` - Update promotion (admin)
- `DELETE /api/promotions/{id}` - Delete promotion (admin)

## Database Schema

### Users Table
- Roles: farmer, consumer, retailer, logistics, admin
- Status: active, inactive, suspended

### Products Table
- Categories: vegetables, fruits, grains, dairy, spices
- Status: active, inactive, out_of_stock

### Orders & Order Items
- Complete order management with multiple products
- Status tracking from pending to delivered

### Payments
- Multiple payment methods supported
- Transaction tracking and status management

### Deliveries
- Assignment to logistics managers
- Real-time status updates
- Priority levels and tracking numbers

## Default Users

After seeding, you can login with:

- **Admin**: admin@agrilink.com / password123
- **Farmer**: farmer@agrilink.com / password123
- **Consumer**: consumer@agrilink.com / password123
- **Retailer**: retailer@agrilink.com / password123
- **Logistics**: logistics@agrilink.com / password123

## API Testing

Use tools like Postman or cURL to test the API. Include the Authorization header with Bearer token after login:

```bash
Authorization: Bearer your_token_here
```

## Frontend Integration

This API is designed to work with the AgriLink HTML/CSS/JavaScript frontend. Update your frontend AJAX calls to use these endpoints.

## Development Notes

- All API responses are in JSON format
- Proper error handling with meaningful messages
- Role-based middleware for access control
- Image uploads supported for products
- Comprehensive validation using Form Requests
- Database relationships properly defined
- Factory and seeder classes for testing data

## Production Deployment

1. Set `APP_ENV=production` in `.env`
2. Configure proper database credentials
3. Set up proper file storage for product images
4. Configure CORS for your frontend domain
5. Use proper web server (Apache/Nginx) with PHP-FPM