<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'AgriLink API is running',
        'version' => '1.0',
        'status' => 'active',
        'endpoints' => [
            'products' => '/api/products',
            'orders' => '/api/orders',
            'users' => '/api/users'
        ]
    ]);
});
