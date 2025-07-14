<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Delivery;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get dashboard analytics
     */
    public function analytics(): JsonResponse
    {
        try {
            $analytics = [
                'users' => [
                    'total' => User::count(),
                    'farmers' => User::where('role', 'farmer')->count(),
                    'consumers' => User::where('role', 'consumer')->count(),
                    'retailers' => User::where('role', 'retailer')->count(),
                    'logistics' => User::where('role', 'logistics')->count(),
                    'new_this_month' => User::whereMonth('created_at', now()->month)->count(),
                ],
                'products' => [
                    'total' => Product::count(),
                    'active' => Product::where('status', 'active')->count(),
                    'out_of_stock' => Product::where('status', 'out_of_stock')->count(),
                    'by_category' => Product::groupBy('category')
                        ->select('category', DB::raw('count(*) as total'))
                        ->get(),
                ],
                'orders' => [
                    'total' => Order::count(),
                    'pending' => Order::where('status', 'pending')->count(),
                    'confirmed' => Order::where('status', 'confirmed')->count(),
                    'delivered' => Order::where('status', 'delivered')->count(),
                    'cancelled' => Order::where('status', 'cancelled')->count(),
                    'total_revenue' => Order::where('status', 'delivered')->sum('total_amount'),
                    'monthly_revenue' => Order::where('status', 'delivered')
                        ->whereMonth('created_at', now()->month)
                        ->sum('total_amount'),
                ],
                'deliveries' => [
                    'total' => Delivery::count(),
                    'assigned' => Delivery::where('status', 'assigned')->count(),
                    'in_transit' => Delivery::where('status', 'in_transit')->count(),
                    'delivered' => Delivery::where('status', 'delivered')->count(),
                    'failed' => Delivery::where('status', 'failed')->count(),
                ],
                'promotions' => [
                    'total' => Promotion::count(),
                    'active' => Promotion::active()->count(),
                ]
            ];

            return response()->json([
                'success' => true,
                'analytics' => $analytics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all users for management
     */
    public function users(Request $request): JsonResponse
    {
        try {
            $query = User::query();

            // Filter by role
            if ($request->has('role') && $request->role) {
                $query->where('role', $request->role);
            }

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            // Search by name or email
            if ($request->has('search') && $request->search) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('email', 'like', '%' . $request->search . '%');
                });
            }

            $users = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'users' => $users
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user status
     */
    public function updateUserStatus(Request $request, User $user): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'status' => 'required|in:active,inactive,suspended'
            ]);

            $user->update($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'User status updated successfully',
                'user' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user
     */
    public function deleteUser(User $user): JsonResponse
    {
        try {
            // Prevent deleting admin users
            if ($user->role === 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete admin users'
                ], 403);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all orders for management
     */
    public function orders(Request $request): JsonResponse
    {
        try {
            $query = Order::with(['user', 'orderItems.product']);

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            // Filter by date range
            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
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
}