<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'discount_percentage',
        'discount_amount',
        'start_date',
        'end_date',
        'status',
        'applicable_to',
        'min_order_amount',
        'max_discount_amount',
    ];

    protected $casts = [
        'discount_percentage' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    // Promotion status
    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_EXPIRED = 'expired';

    // Applicable to
    const APPLICABLE_ALL = 'all';
    const APPLICABLE_FARMERS = 'farmers';
    const APPLICABLE_CONSUMERS = 'consumers';
    const APPLICABLE_RETAILERS = 'retailers';

    public static function getStatuses()
    {
        return [
            self::STATUS_ACTIVE,
            self::STATUS_INACTIVE,
            self::STATUS_EXPIRED,
        ];
    }

    public static function getApplicableTo()
    {
        return [
            self::APPLICABLE_ALL,
            self::APPLICABLE_FARMERS,
            self::APPLICABLE_CONSUMERS,
            self::APPLICABLE_RETAILERS,
        ];
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
                    ->where('start_date', '<=', now())
                    ->where('end_date', '>=', now());
    }

    public function scopeForRole($query, $role)
    {
        return $query->where(function ($q) use ($role) {
            $q->where('applicable_to', self::APPLICABLE_ALL)
              ->orWhere('applicable_to', $role . 's'); // farmers, consumers, retailers
        });
    }

    // Check if promotion is currently valid
    public function isValid()
    {
        return $this->status === self::STATUS_ACTIVE
            && $this->start_date <= now()
            && $this->end_date >= now();
    }

    // Calculate discount for given amount
    public function calculateDiscount($amount)
    {
        if (!$this->isValid()) {
            return 0;
        }

        if ($this->min_order_amount && $amount < $this->min_order_amount) {
            return 0;
        }

        $discount = 0;

        if ($this->discount_percentage) {
            $discount = ($amount * $this->discount_percentage) / 100;
        } elseif ($this->discount_amount) {
            $discount = $this->discount_amount;
        }

        // Apply max discount limit if set
        if ($this->max_discount_amount && $discount > $this->max_discount_amount) {
            $discount = $this->max_discount_amount;
        }

        return $discount;
    }
}