<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $farmers = User::where('role', 'farmer')->get();

        $sampleProducts = [
            [
                'name' => 'Fresh Tomatoes',
                'category' => 'vegetables',
                'description' => 'Farm fresh red tomatoes, perfect for cooking and salads',
                'price' => 40.00,
                'quantity' => 500,
                'unit' => 'kg',
            ],
            [
                'name' => 'Sweet Corn',
                'category' => 'vegetables',
                'description' => 'Sweet and tender corn, locally grown',
                'price' => 35.00,
                'quantity' => 300,
                'unit' => 'kg',
            ],
            [
                'name' => 'Red Apples',
                'category' => 'fruits',
                'description' => 'Crisp and sweet red apples',
                'price' => 80.00,
                'quantity' => 200,
                'unit' => 'kg',
            ],
            [
                'name' => 'Bananas',
                'category' => 'fruits',
                'description' => 'Sweet bananas, perfect for breakfast',
                'price' => 25.00,
                'quantity' => 400,
                'unit' => 'kg',
            ],
            [
                'name' => 'White Rice',
                'category' => 'grains',
                'description' => 'Premium quality white rice',
                'price' => 120.00,
                'quantity' => 1000,
                'unit' => 'kg',
            ],
            [
                'name' => 'Wheat Flour',
                'category' => 'grains',
                'description' => 'Fine wheat flour for baking',
                'price' => 90.00,
                'quantity' => 800,
                'unit' => 'kg',
            ],
            [
                'name' => 'Fresh Milk',
                'category' => 'dairy',
                'description' => 'Fresh cow milk from grass-fed cows',
                'price' => 60.00,
                'quantity' => 100,
                'unit' => 'liter',
            ],
            [
                'name' => 'Black Pepper',
                'category' => 'spices',
                'description' => 'Aromatic black pepper spice',
                'price' => 200.00,
                'quantity' => 50,
                'unit' => 'kg',
            ],
            [
                'name' => 'Coriander Seeds',
                'category' => 'spices',
                'description' => 'Fresh coriander seeds for cooking',
                'price' => 150.00,
                'quantity' => 30,
                'unit' => 'kg',
            ],
            [
                'name' => 'Green Beans',
                'category' => 'vegetables',
                'description' => 'Fresh green beans, great for stir-fry',
                'price' => 45.00,
                'quantity' => 250,
                'unit' => 'kg',
            ],
        ];

        foreach ($sampleProducts as $productData) {
            Product::create(array_merge($productData, [
                'farmer_id' => $farmers->random()->id,
                'status' => 'active',
            ]));
        }

        // Create additional random products
        Product::factory(50)->create();
    }
}