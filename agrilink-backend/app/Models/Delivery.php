<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'assigned_to',
        'delivery_address',
        'scheduled_date',
        'delivered_date',
        'status',
        'priority',
        'tracking_number',
        'notes',
    ];

    protected $casts = [
        'scheduled_date' => 'datetime',
        'delivered_date' => 'datetime',
    ];

    // Delivery status constants
    const STATUS_ASSIGNED = 'assigned';
    const STATUS_IN_TRANSIT = 'in_transit';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_FAILED = 'failed';
    const STATUS_RETURNED = 'returned';

    // Priority levels
    const PRIORITY_LOW = 'low';
    const PRIORITY_MEDIUM = 'medium';
    const PRIORITY_HIGH = 'high';
    const PRIORITY_URGENT = 'urgent';

    public static function getStatuses()
    {
        return [
            self::STATUS_ASSIGNED,
            self::STATUS_IN_TRANSIT,
            self::STATUS_DELIVERED,
            self::STATUS_FAILED,
            self::STATUS_RETURNED,
        ];
    }

    public static function getPriorities()
    {
        return [
            self::PRIORITY_LOW,
            self::PRIORITY_MEDIUM,
            self::PRIORITY_HIGH,
            self::PRIORITY_URGENT,
        ];
    }

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function logisticsManager()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function statusUpdates()
    {
        return $this->hasMany(DeliveryStatusUpdate::class);
    }

    // Generate tracking number
    public static function generateTrackingNumber()
    {
        return 'TRK-' . now()->format('Y') . '-' . strtoupper(substr(uniqid(), -8));
    }

    // Boot method to auto-generate tracking number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($delivery) {
            if (!$delivery->tracking_number) {
                $delivery->tracking_number = static::generateTrackingNumber();
            }
        });
    }
}