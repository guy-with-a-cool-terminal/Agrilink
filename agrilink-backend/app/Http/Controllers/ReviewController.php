<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\ReviewRequest;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Review::with(['reviewer', 'reviewee', 'order', 'approvedBy']);

        // Admin can see all reviews
        if ($user->isAdmin()) {
            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
        } else {
            // Users can only see approved reviews about themselves or reviews they wrote
            $query->where(function ($q) use ($user) {
                $q->where('reviewee_id', $user->id)->where('status', Review::STATUS_APPROVED)
                  ->orWhere('reviewer_id', $user->id);
            });
        }

        $reviews = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    public function store(ReviewRequest $request)
    {
        $user = Auth::user();
        $orderData = $request->validated();

        // Get the order
        $order = Order::with(['user', 'orderItems.product.user'])->find($orderData['order_id']);
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        // Check if order is completed/delivered
        if (!in_array($order->status, ['delivered', 'completed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Reviews can only be submitted for completed orders'
            ], 400);
        }

        // Check if user can review this order (must be involved in the order)
        $canReview = $this->canUserReviewOrder($user, $order, $orderData['reviewee_id']);
        
        if (!$canReview) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to review this order or user'
            ], 403);
        }

        // Check if review already exists
        $existingReview = Review::where([
            'order_id' => $orderData['order_id'],
            'reviewer_id' => $user->id,
            'reviewee_id' => $orderData['reviewee_id']
        ])->first();

        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reviewed this user for this order'
            ], 400);
        }

        // Create the review
        $review = Review::create([
            'order_id' => $orderData['order_id'],
            'reviewer_id' => $user->id,
            'reviewee_id' => $orderData['reviewee_id'],
            'rating' => $orderData['rating'],
            'comment' => $orderData['comment'] ?? null,
        ]);

        $review->load(['reviewer', 'reviewee', 'order']);

        return response()->json([
            'success' => true,
            'message' => $review->isApproved() ? 'Review submitted and approved' : 'Review submitted for admin approval',
            'data' => $review
        ], 201);
    }

    public function show($id)
    {
        $user = Auth::user();
        $review = Review::with(['reviewer', 'reviewee', 'order', 'approvedBy'])->find($id);

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found'
            ], 404);
        }

        // Check if user can view this review
        if (!$user->isAdmin() && 
            $review->reviewer_id !== $user->id && 
            ($review->reviewee_id !== $user->id || !$review->isApproved())) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $review
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can update reviews'
            ], 403);
        }

        $review = Review::find($id);
        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found'
            ], 404);
        }

        $request->validate([
            'status' => 'required|in:pending,approved,flagged,rejected',
            'admin_notes' => 'nullable|string|max:1000'
        ]);

        $review->status = $request->status;
        $review->admin_notes = $request->admin_notes;
        
        if ($request->status === Review::STATUS_APPROVED) {
            $review->approved_at = now();
            $review->approved_by = $user->id;
        } else {
            $review->approved_at = null;
            $review->approved_by = null;
        }

        $review->save();
        $review->load(['reviewer', 'reviewee', 'order', 'approvedBy']);

        return response()->json([
            'success' => true,
            'message' => 'Review status updated successfully',
            'data' => $review
        ]);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can delete reviews'
            ], 403);
        }

        $review = Review::find($id);
        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found'
            ], 404);
        }

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully'
        ]);
    }

    // Get reviews for a specific user
    public function getUserReviews($userId)
    {
        $currentUser = Auth::user();
        $targetUser = User::find($userId);

        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Only show approved reviews for non-admin users
        $query = Review::with(['reviewer', 'order'])
            ->where('reviewee_id', $userId);

        if (!$currentUser->isAdmin()) {
            $query->where('status', Review::STATUS_APPROVED);
        }

        $reviews = $query->orderBy('created_at', 'desc')->get();

        // Calculate average rating
        $avgRating = $reviews->where('status', Review::STATUS_APPROVED)->avg('rating');

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $targetUser,
                'reviews' => $reviews,
                'average_rating' => $avgRating ? round($avgRating, 1) : null,
                'total_reviews' => $reviews->where('status', Review::STATUS_APPROVED)->count()
            ]
        ]);
    }

    // Get potential reviewees for an order
    public function getOrderReviewees($orderId)
    {
        $user = Auth::user();
        $order = Order::with(['user', 'orderItems.product.user', 'delivery.user'])->find($orderId);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        // Check if order is completed
        if (!in_array($order->status, ['delivered', 'completed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Reviews can only be submitted for completed orders'
            ], 400);
        }

        $reviewees = [];

        // Consumer can review farmers and retailers
        if ($user->isConsumer() && $order->user_id === $user->id) {
            // Get farmers from order items
            foreach ($order->orderItems as $item) {
                if ($item->product && $item->product->user && $item->product->user->isFarmer()) {
                    $reviewees[] = $item->product->user;
                }
            }
            
            // Get retailer if order came through retailer (this would need additional logic)
            // For now, we'll skip retailer identification
        }

        // Farmer can review consumers who bought their products
        if ($user->isFarmer()) {
            $farmerHasProducts = $order->orderItems->contains(function ($item) use ($user) {
                return $item->product && $item->product->farmer_id === $user->id;
            });
            
            if ($farmerHasProducts) {
                $reviewees[] = $order->user;
            }
        }

        // Retailer can review farmers and consumers
        if ($user->isRetailer()) {
            // Logic for retailer reviews would go here
            // This depends on how retailer orders are structured
        }

        // Logistics can be reviewed by everyone, and can review everyone
        if ($order->delivery && $order->delivery->assigned_to) {
            $logisticsUser = $order->delivery->user;
            if ($logisticsUser && !$reviewees->contains('id', $logisticsUser->id) && $logisticsUser->id !== $user->id) {
                $reviewees[] = $logisticsUser;
            }
        }

        if ($user->isLogistics() && $order->delivery && $order->delivery->assigned_to === $user->id) {
            if (!$reviewees->contains('id', $order->user_id)) {
                $reviewees[] = $order->user;
            }
        }

        // Remove duplicates and current user
        $reviewees = collect($reviewees)->unique('id')->reject(function ($reviewee) use ($user) {
            return $reviewee->id === $user->id;
        });

        // Check which reviews already exist
        $existingReviews = Review::where('order_id', $orderId)
            ->where('reviewer_id', $user->id)
            ->pluck('reviewee_id')
            ->toArray();

        $reviewees = $reviewees->reject(function ($reviewee) use ($existingReviews) {
            return in_array($reviewee->id, $existingReviews);
        });

        return response()->json([
            'success' => true,
            'data' => $reviewees->values()
        ]);
    }

    private function canUserReviewOrder($user, $order, $revieweeId)
    {
        $reviewee = User::find($revieweeId);
        if (!$reviewee) {
            return false;
        }

        // Consumer can review farmers, retailers, and logistics
        if ($user->isConsumer() && $order->user_id === $user->id) {
            // Can review farmers who provided products
            if ($reviewee->isFarmer()) {
                return $order->orderItems->contains(function ($item) use ($revieweeId) {
                    return $item->product && $item->product->farmer_id === $revieweeId;
                });
            }
            
            // Can review logistics provider
            if ($reviewee->isLogistics() && $order->delivery) {
                return $order->delivery->assigned_to === $revieweeId;
            }
        }

        // Farmer can review consumers who bought their products
        if ($user->isFarmer()) {
            $farmerHasProducts = $order->orderItems->contains(function ($item) use ($user) {
                return $item->product && $item->product->farmer_id === $user->id;
            });
            
            if ($farmerHasProducts && $reviewee->isConsumer() && $revieweeId === $order->user_id) {
                return true;
            }
        }

        // Logistics can review everyone involved in their deliveries
        if ($user->isLogistics() && $order->delivery && $order->delivery->assigned_to === $user->id) {
            return true;
        }

        // Everyone can review logistics
        if ($reviewee->isLogistics() && $order->delivery && $order->delivery->assigned_to === $revieweeId) {
            return true;
        }

        return false;
    }
}