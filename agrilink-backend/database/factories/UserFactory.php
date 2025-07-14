<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => '+254' . fake()->numberBetween(700000000, 799999999),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => fake()->randomElement(['farmer', 'consumer', 'retailer', 'logistics']),
            'status' => fake()->randomElement(['active', 'inactive']),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user should be a farmer.
     */
    public function farmer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'farmer',
        ]);
    }

    /**
     * Indicate that the user should be a consumer.
     */
    public function consumer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'consumer',
        ]);
    }

    /**
     * Indicate that the user should be a retailer.
     */
    public function retailer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'retailer',
        ]);
    }

    /**
     * Indicate that the user should be a logistics manager.
     */
    public function logistics(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'logistics',
        ]);
    }

    /**
     * Indicate that the user should be an admin.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
        ]);
    }
}