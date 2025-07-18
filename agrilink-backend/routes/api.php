<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PromotionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public product routes (for browsing without authentication)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/products/categories', [ProductController::class, 'categories']);

// Public delivery tracking
Route::get('/deliveries/track/{trackingNumber}', [DeliveryController::class, 'track']);

// 🔧 Custom Maintenance Mode Routes (moved outside auth - status should be public)
Route::get('/admin/maintenance/status', function () {
    // Use cache to store maintenance mode state instead of Laravel's built-in
    $maintenance = Cache::get('maintenance_mode', false);
    return response()->json([
        'maintenance' => $maintenance
    ]);
});

// Maintenance control routes (require admin auth)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('/admin/maintenance/enable', function () {
        // Store maintenance mode state in cache
        Cache::put('maintenance_mode', true, now()->addDays(30));
        
        return response()->json([
            'message' => 'Maintenance mode enabled',
            'maintenance' => true
        ]);
    });

    Route::post('/admin/maintenance/disable', function () {
        // Remove maintenance mode state from cache
        Cache::forget('maintenance_mode');
        
        return response()->json([
            'message' => 'Maintenance mode disabled',
            'maintenance' => false
        ]);
    });
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Product routes (farmers can manage their products)
    Route::middleware('role:farmer')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    });

    // Order routes (consumers, retailers can place orders)
    Route::middleware('role:consumer,retailer')->group(function () {
        Route::post('/orders', [OrderController::class, 'store']);
        Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
    });

    // Order management (all authenticated users can view their orders)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::get('/orders/statuses', [OrderController::class, 'statuses']);

    // Order status updates (admin, logistics)
    Route::middleware('role:admin,logistics')->group(function () {
        Route::put('/orders/{order}', [OrderController::class, 'update']);
    });

    // Delivery routes
    Route::get('/deliveries', [DeliveryController::class, 'index']);
    Route::get('/deliveries/statuses', [DeliveryController::class, 'statuses']);
    Route::get('/deliveries/priorities', [DeliveryController::class, 'priorities']);

    // Delivery management (admin, logistics)
    Route::middleware('role:admin,logistics')->group(function () {
        Route::post('/deliveries/{delivery}/assign', [DeliveryController::class, 'assign']);
        Route::post('/deliveries/{delivery}/status', [DeliveryController::class, 'updateStatus']);
    });

    // Promotion routes (public viewing)
    Route::get('/promotions', [PromotionController::class, 'index']);
    Route::get('/promotions/{promotion}', [PromotionController::class, 'show']);
    Route::get('/promotions/applicable', [PromotionController::class, 'applicable']);
    Route::post('/promotions/calculate-discount', [PromotionController::class, 'calculateDiscount']);

    // Promotion management (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::post('/promotions', [PromotionController::class, 'store']);
        Route::put('/promotions/{promotion}', [PromotionController::class, 'update']);
        Route::delete('/promotions/{promotion}', [PromotionController::class, 'destroy']);
    });

    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/analytics', [AdminController::class, 'analytics']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::put('/users/{user}/status', [AdminController::class, 'updateUserStatus']);
        Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
        Route::get('/orders', [AdminController::class, 'orders']);
    });
});