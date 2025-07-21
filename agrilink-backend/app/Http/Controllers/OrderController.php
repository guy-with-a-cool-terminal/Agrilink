<?php

namespace App\Http\Controllers;

use App\Http\Requests\OrderRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Payment;
use App\Models\Delivery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of orders
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Order::with(['user', 'orderItems.product', 'payment', 'delivery']);

            // Filter by user (for user's own orders)
            if (auth()->user()->role !== 'admin') {
                $query->where('user_id', auth()->id());
            }

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            $orders = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'orders' => $orders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created order
     */
    public function store(OrderRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Create the order
            $order = Order::create([
                'user_id' => auth()->id(),
                'status' => Order::STATUS_PENDING,
                'total_amount' => 0, // Will be calculated below
                'delivery_address' => $request->delivery_address,
                'delivery_date' => $request->delivery_date,
                'notes' => $request->notes,
            ]);

            $totalAmount = 0;

            // Create order items
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);

                // Check if enough stock is available
                if ($product->quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }

                // Create order item
                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                ]);

                $totalAmount += $orderItem->total_price;

                // Update product stock
                $product->decrement('quantity', $item['quantity']);
                
                // Update product status if out of stock
                if ($product->quantity <= 0) {
                    $product->update(['status' => 'out_of_stock']);
                }
            }

            // Update order total
            $order->update(['total_amount' => $totalAmount]);

            // Create payment record
            if ($request->has('payment_method')) {
                Payment::create([
                    'order_id' => $order->id,
                    'payment_method' => $request->payment_method,
                    'amount' => $totalAmount,
                    'status' => 'pending',
                ]);
            }

            // Create delivery record
            Delivery::create([
                'order_id' => $order->id,
                'delivery_address' => $request->delivery_address,
                'scheduled_date' => $request->delivery_date,
                'priority' => $request->priority ?? 'medium',
            ]);

            DB::commit();

            $order->load(['orderItems.product', 'payment', 'delivery']);

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully',
                'order' => $order
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to place order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified order
     */
    public function show(Order $order): JsonResponse
    {
        try {
            // Check if user can view this order
            if (auth()->user()->role !== 'admin' && $order->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view this order'
                ], 403);
            }

            $order->load(['user', 'orderItems.product.farmer', 'payment', 'delivery.logisticsManager']);

            return response()->json([
                'success' => true,
                'order' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified order
     */
    public function update(Request $request, Order $order): JsonResponse
    {
        try {
            // Only allow status updates by admins or logistics managers
            if (!in_array(auth()->user()->role, ['admin', 'logistics'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update order'
                ], 403);
            }

            $validatedData = $request->validate([
                'status' => 'required|in:' . implode(',', Order::getStatuses()),
                'notes' => 'nullable|string'
            ]);

            $order->update($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Order updated successfully',
                'order' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel the specified order
     */
    public function cancel(Order $order): JsonResponse
    {
        try {
            // Check if user can cancel this order
            if (auth()->user()->role !== 'admin' && $order->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to cancel this order'
                ], 403);
            }

            // Only allow cancellation if order is pending or confirmed
            if (!in_array($order->status, ['pending', 'confirmed'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order cannot be cancelled at this stage'
                ], 400);
            }

            DB::beginTransaction();

            // Restore product stock
            foreach ($order->orderItems as $item) {
                $item->product->increment('quantity', $item->quantity);
                
                // Update product status if it was out of stock
                if ($item->product->status === 'out_of_stock') {
                    $item->product->update(['status' => 'active']);
                }
            }

            // Update order status
            $order->update(['status' => 'cancelled']);

            // Update payment status if exists
            if ($order->payment) {
                $order->payment->update(['status' => 'refunded']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'order' => $order
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order statuses
     */
    public function statuses(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'statuses' => Order::getStatuses()
        ]);
    }
}