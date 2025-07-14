<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@agrilink.com',
            'phone' => '+254700000001',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // Create sample farmers
        User::create([
            'name' => 'John Farmer',
            'email' => 'farmer@agrilink.com',
            'phone' => '+254700000002',
            'password' => Hash::make('password123'),
            'role' => 'farmer',
        ]);

        User::create([
            'name' => 'Mary Wanjiku',
            'email' => 'mary.farmer@agrilink.com',
            'phone' => '+254700000003',
            'password' => Hash::make('password123'),
            'role' => 'farmer',
        ]);

        // Create sample consumers
        User::create([
            'name' => 'Jane Consumer',
            'email' => 'consumer@agrilink.com',
            'phone' => '+254700000004',
            'password' => Hash::make('password123'),
            'role' => 'consumer',
        ]);

        User::create([
            'name' => 'Peter Kimani',
            'email' => 'peter.consumer@agrilink.com',
            'phone' => '+254700000005',
            'password' => Hash::make('password123'),
            'role' => 'consumer',
        ]);

        // Create sample retailer
        User::create([
            'name' => 'Sarah Retailer',
            'email' => 'retailer@agrilink.com',
            'phone' => '+254700000006',
            'password' => Hash::make('password123'),
            'role' => 'retailer',
        ]);

        // Create sample logistics manager
        User::create([
            'name' => 'David Logistics',
            'email' => 'logistics@agrilink.com',
            'phone' => '+254700000007',
            'password' => Hash::make('password123'),
            'role' => 'logistics',
        ]);

        // Create additional users using factory
        User::factory(20)->create();
    }
}