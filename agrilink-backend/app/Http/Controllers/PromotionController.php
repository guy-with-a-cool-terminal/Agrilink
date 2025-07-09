<?php

namespace App\Http\Controllers;

use App\Http\Requests\PromotionRequest;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    /**
     * Display a listing of promotions
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Promotion::query();

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            // Filter by applicable role
            if ($request->has('role') && $request->role) {
                $query->forRole($request->role);
            }

            // Active promotions only
            if ($request->has('active_only') && $request->active_only) {
                $query->active();
            }

            $promotions = $query->orderBy('start_date', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'promotions' => $promotions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch promotions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created promotion
     */
    public function store(PromotionRequest $request): JsonResponse
    {
        try {
            $promotion = Promotion::create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Promotion created successfully',
                'promotion' => $promotion
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create promotion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified promotion
     */
    public function show(Promotion $promotion): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'promotion' => $promotion
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Promotion not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified promotion
     */
    public function update(PromotionRequest $request, Promotion $promotion): JsonResponse
    {
        try {
            $promotion->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Promotion updated successfully',
                'promotion' => $promotion
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update promotion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified promotion
     */
    public function destroy(Promotion $promotion): JsonResponse
    {
        try {
            $promotion->delete();

            return response()->json([
                'success' => true,
                'message' => 'Promotion deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete promotion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate discount for order amount
     */
    public function calculateDiscount(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'promotion_id' => 'required|exists:promotions,id',
                'amount' => 'required|numeric|min:0'
            ]);

            $promotion = Promotion::findOrFail($validatedData['promotion_id']);
            $discount = $promotion->calculateDiscount($validatedData['amount']);

            return response()->json([
                'success' => true,
                'promotion' => $promotion,
                'original_amount' => $validatedData['amount'],
                'discount_amount' => $discount,
                'final_amount' => $validatedData['amount'] - $discount
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate discount',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get applicable promotions for user
     */
    public function applicable(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            
            $promotions = Promotion::active()
                ->forRole($user->role)
                ->get();

            return response()->json([
                'success' => true,
                'promotions' => $promotions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch applicable promotions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}