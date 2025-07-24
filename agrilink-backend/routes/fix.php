// Add this route to create deliveries
Route::middleware('role:admin,logistics')->group(function () {
    Route::post('/deliveries', [DeliveryController::class, 'store']); // Create delivery
    Route::post('/deliveries/{delivery}/assign', [DeliveryController::class, 'assign']);
    Route::post('/deliveries/{delivery}/status', [DeliveryController::class, 'updateStatus']);
});