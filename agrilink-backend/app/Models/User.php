<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // User roles
    const ROLE_FARMER = 'farmer';
    const ROLE_CONSUMER = 'consumer';
    const ROLE_RETAILER = 'retailer';
    const ROLE_LOGISTICS = 'logistics';
    const ROLE_ADMIN = 'admin';

    public static function getRoles()
    {
        return [
            self::ROLE_FARMER,
            self::ROLE_CONSUMER,
            self::ROLE_RETAILER,
            self::ROLE_LOGISTICS,
            self::ROLE_ADMIN,
        ];
    }

    // Role checking methods
    public function isFarmer()
    {
        return $this->role === self::ROLE_FARMER;
    }

    public function isConsumer()
    {
        return $this->role === self::ROLE_CONSUMER;
    }

    public function isRetailer()
    {
        return $this->role === self::ROLE_RETAILER;
    }

    public function isLogistics()
    {
        return $this->role === self::ROLE_LOGISTICS;
    }

    public function isAdmin()
    {
        return $this->role === self::ROLE_ADMIN;
    }

    // Relationships
    public function products()
    {
        return $this->hasMany(Product::class, 'farmer_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function deliveries()
    {
        return $this->hasMany(Delivery::class, 'assigned_to');
    }

    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'reviewee_id');
    }

    public function approvedReviews()
    {
        return $this->hasMany(Review::class, 'approved_by');
    }
}