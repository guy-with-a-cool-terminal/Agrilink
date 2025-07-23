<?php

namespace Database\Seeders;

use App\Models\Promotion;
use Illuminate\Database\Seeder;

class PromotionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $promotions = [
            [
                'title' => 'New Year Special',
                'description' => 'Get 15% off on all orders above KSh 1000',
                'discount_percentage' => 15.00,
                'start_date' => now()->subDays(10),
                'end_date' => now()->addDays(20),
                'status' => 'active',
                'applicable_to' => 'all',
                'min_order_amount' => 1000.00,
                'max_discount_amount' => 500.00,
            ],
            [
                'title' => 'Farmer Support Program',
                'description' => 'Special discount for farmers on agricultural tools',
                'discount_amount' => 200.00,
                'start_date' => now()->subDays(5),
                'end_date' => now()->addDays(30),
                'status' => 'active',
                'applicable_to' => 'farmers',
                'min_order_amount' => 500.00,
            ],
            [
                'title' => 'Bulk Order Discount',
                'description' => '10% off for retailers on bulk orders',
                'discount_percentage' => 10.00,
                'start_date' => now()->subDays(15),
                'end_date' => now()->addDays(15),
                'status' => 'active',
                'applicable_to' => 'retailers',
                'min_order_amount' => 2000.00,
                'max_discount_amount' => 1000.00,
            ],
            [
                'title' => 'Welcome Bonus',
                'description' => 'KSh 100 off for new consumers',
                'discount_amount' => 100.00,
                'start_date' => now()->subDays(30),
                'end_date' => now()->addDays(60),
                'status' => 'active',
                'applicable_to' => 'consumers',
                'min_order_amount' => 300.00,
            ],
            [
                'title' => 'End of Season Sale',
                'description' => 'Massive 25% discount on selected items',
                'discount_percentage' => 25.00,
                'start_date' => now()->addDays(30),
                'end_date' => now()->addDays(45),
                'status' => 'inactive',
                'applicable_to' => 'all',
                'min_order_amount' => 800.00,
                'max_discount_amount' => 800.00,
            ],
        ];

        foreach ($promotions as $promotion) {
            Promotion::create($promotion);
        }
    }
}