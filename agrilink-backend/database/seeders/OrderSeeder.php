<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Payment;
use App\Models\Delivery;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $consumers = User::whereIn('role', ['consumer', 'retailer'])->get();
        $products = Product::where('status', 'active')->get();
        $logisticsManagers = User::where('role', 'logistics')->get();

        for ($i = 0; $i < 20; $i++) {
            $consumer = $consumers->random();
            
            // Create order
            $order = Order::create([
                'user_id' => $consumer->id,
                'total_amount' => 0,
                'status' => collect(['pending', 'confirmed', 'processing', 'shipped', 'delivered'])->random(),
                'delivery_address' => fake()->address(),
                'delivery_date' => fake()->dateTimeBetween('+1 day', '+7 days'),
                'notes' => fake()->optional()->sentence(),
            ]);

            $totalAmount = 0;
            $itemCount = rand(1, 5);

            // Create order items
            for ($j = 0; $j < $itemCount; $j++) {
                $product = $products->random();
                $quantity = rand(1, 10);

                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $product->price,
                ]);

                $totalAmount += $orderItem->total_price;
            }

            // Update order total
            $order->update(['total_amount' => $totalAmount]);

            // Create payment
            Payment::create([
                'order_id' => $order->id,
                'payment_method' => collect(['cash', 'card', 'mobile_money', 'bank_transfer'])->random(),
                'amount' => $totalAmount,
                'status' => collect(['pending', 'processing', 'completed', 'failed'])->random(),
                'payment_date' => in_array($order->status, ['delivered', 'shipped']) ? fake()->dateTimeBetween('-30 days', 'now') : null,
            ]);

            // Create delivery
            Delivery::create([
                'order_id' => $order->id,
                'assigned_to' => $logisticsManagers->isNotEmpty() ? $logisticsManagers->random()->id : null,
                'delivery_address' => $order->delivery_address,
                'scheduled_date' => $order->delivery_date,
                'delivered_date' => $order->status === 'delivered' ? fake()->dateTimeBetween('-30 days', 'now') : null,
                'status' => $this->getDeliveryStatus($order->status),
                'priority' => collect(['low', 'medium', 'high', 'urgent'])->random(),
            ]);
        }
    }

    private function getDeliveryStatus($orderStatus)
    {
        return match ($orderStatus) {
            'pending', 'confirmed' => 'assigned',
            'processing', 'shipped' => 'in_transit',
            'delivered' => 'delivered',
            default => 'assigned'
        };
    }
}