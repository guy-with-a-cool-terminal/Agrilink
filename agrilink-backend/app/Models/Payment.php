<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'payment_method',
        'amount',
        'status',
        'transaction_id',
        'payment_date',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
    ];

    // Payment status constants
    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_REFUNDED = 'refunded';

    // Payment methods - Updated to match validation rules
    const METHOD_CASH_ON_DELIVERY = 'cash_on_delivery';
    const METHOD_MOBILE_MONEY = 'mobile_money';
    const METHOD_CARD = 'card';
    const METHOD_BANK_TRANSFER = 'bank_transfer';

    public static function getStatuses()
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_PROCESSING,
            self::STATUS_COMPLETED,
            self::STATUS_FAILED,
            self::STATUS_REFUNDED,
        ];
    }

    public static function getMethods()
    {
        return [
            self::METHOD_CASH_ON_DELIVERY,
            self::METHOD_MOBILE_MONEY,
            self::METHOD_CARD,
            self::METHOD_BANK_TRANSFER,
        ];
    }

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Generate transaction ID
    public static function generateTransactionId()
    {
        return 'TXN-' . now()->format('YmdHis') . '-' . strtoupper(substr(uniqid(), -6));
    }

    // Boot method to auto-generate transaction ID
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (!$payment->transaction_id) {
                $payment->transaction_id = static::generateTransactionId();
            }
        });
    }
}