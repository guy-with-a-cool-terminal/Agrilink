<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // leave empty or register bindings here if needed
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ✅ Fix the migration config here instead
         \Log::info('AppServiceProvider boot loaded');
        // config(['database.migrations' => config('database.migrations.table')]);
         config(['database.migrations' => 'migrations']);
    }
}
