<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\DeliveryStatusUpdate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    /**
     * Display a listing of deliveries
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Delivery::with(['order.user', 'logisticsManager']);

            // Filter by assigned logistics manager
            if (auth()->user()->role === 'logistics') {
                $query->where('assigned_to', auth()->id());
            }

            if (auth()->user()->role === 'retailer' || auth()->user()->role === 'consumer') {
                $query->whereHas('order', function ($q) {
                    $q->where('user_id', auth()->id());
                });
            }
            
            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            // Filter by priority
            if ($request->has('priority') && $request->priority) {
                $query->where('priority', $request->priority);
            }

            $deliveries = $query->orderBy('priority', 'desc')
                ->orderBy('scheduled_date', 'asc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'deliveries' => $deliveries
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch deliveries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign delivery to logistics manager
     */
    public function assign(Request $request, Delivery $delivery): JsonResponse
    {
        try {
            // Only admins and logistics managers can assign deliveries
            if (!in_array(auth()->user()->role, ['admin', 'logistics'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to assign delivery'
                ], 403);
            }

            $validatedData = $request->validate([
                'assigned_to' => 'required|exists:users,id',
                'scheduled_date' => 'nullable|date|after:now',
                'priority' => 'nullable|in:' . implode(',', Delivery::getPriorities()),
                'notes' => 'nullable|string'
            ]);

            $delivery->update($validatedData);

            // Create status update
            DeliveryStatusUpdate::create([
                'delivery_id' => $delivery->id,
                'status' => 'assigned',
                'notes' => 'Delivery assigned to logistics manager',
                'updated_by' => auth()->id(),
            ]);

            $delivery->load(['order.user', 'logisticsManager']);

            return response()->json([
                'success' => true,
                'message' => 'Delivery assigned successfully',
                'delivery' => $delivery
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign delivery',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update delivery status
     */
    public function updateStatus(Request $request, Delivery $delivery): JsonResponse
    {
        try {
            // Check if user can update this delivery
            if (auth()->user()->role === 'logistics' && $delivery->assigned_to !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update this delivery'
                ], 403);
            }

            $validatedData = $request->validate([
                'status' => 'required|in:' . implode(',', Delivery::getStatuses()),
                'location' => 'nullable|string',
                'notes' => 'nullable|string'
            ]);

            // Update delivery status
            $delivery->update(['status' => $validatedData['status']]);

            // Set delivered date if status is delivered
            if ($validatedData['status'] === 'delivered') {
                $delivery->update(['delivered_date' => now()]);
                
                // Update order status to delivered
                $delivery->order->update(['status' => 'delivered']);
            }

            // Create status update record
            DeliveryStatusUpdate::create([
                'delivery_id' => $delivery->id,
                'status' => $validatedData['status'],
                'location' => $validatedData['location'] ?? null,
                'notes' => $validatedData['notes'] ?? null,
                'updated_by' => auth()->id(),
            ]);

            $delivery->load(['order.user', 'logisticsManager', 'statusUpdates.updatedBy']);

            return response()->json([
                'success' => true,
                'message' => 'Delivery status updated successfully',
                'delivery' => $delivery
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update delivery status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get delivery tracking information
     */
    public function track(string $trackingNumber): JsonResponse
    {
        try {
            $delivery = Delivery::with(['order.user', 'statusUpdates.updatedBy'])
                ->where('tracking_number', $trackingNumber)
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'delivery' => $delivery
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Delivery not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Get delivery statuses
     */
    public function statuses(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'statuses' => Delivery::getStatuses()
        ]);
    }

    /**
     * Get delivery priorities
     */
    public function priorities(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'priorities' => Delivery::getPriorities()
        ]);
    }
}