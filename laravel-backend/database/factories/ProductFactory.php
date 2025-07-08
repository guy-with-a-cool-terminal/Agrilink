<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = Product::getCategories();
        $category = fake()->randomElement($categories);
        
        $products = [
            'vegetables' => [
                'Tomatoes', 'Onions', 'Carrots', 'Potatoes', 'Cabbage', 'Spinach', 
                'Kale', 'Green Beans', 'Bell Peppers', 'Cucumbers'
            ],
            'fruits' => [
                'Bananas', 'Apples', 'Oranges', 'Mangoes', 'Pineapples', 'Avocados',
                'Grapes', 'Strawberries', 'Watermelons', 'Papayas'
            ],
            'grains' => [
                'Rice', 'Wheat', 'Maize', 'Barley', 'Oats', 'Quinoa',
                'Millet', 'Sorghum', 'Buckwheat', 'Rye'
            ],
            'dairy' => [
                'Fresh Milk', 'Yogurt', 'Cheese', 'Butter', 'Cream',
                'Cottage Cheese', 'Sour Cream', 'Buttermilk'
            ],
            'spices' => [
                'Black Pepper', 'Cinnamon', 'Cardamom', 'Cloves', 'Ginger',
                'Turmeric', 'Coriander', 'Cumin', 'Paprika', 'Chili Powder'
            ]
        ];

        $farmers = User::where('role', 'farmer')->pluck('id');
        
        if ($farmers->isEmpty()) {
            // Create a farmer if none exists
            $farmer = User::factory()->farmer()->create();
            $farmerId = $farmer->id;
        } else {
            $farmerId = fake()->randomElement($farmers->toArray());
        }

        return [
            'farmer_id' => $farmerId,
            'name' => fake()->randomElement($products[$category]),
            'category' => $category,
            'description' => fake()->sentence(10),
            'price' => fake()->numberBetween(20, 500),
            'quantity' => fake()->numberBetween(10, 1000),
            'unit' => fake()->randomElement(['kg', 'gram', 'piece', 'liter', 'bag']),
            'status' => fake()->randomElement(['active', 'inactive', 'out_of_stock']),
        ];
    }

    /**
     * Indicate that the product should be active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    /**
     * Indicate that the product should be out of stock.
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'out_of_stock',
            'quantity' => 0,
        ]);
    }
}