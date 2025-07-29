<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'name',
        'category',
        'description',
        'price',
        'quantity',
        'unit',
        'image',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
    ];

    // Product categories   
//     Seafood 
// Poultry 
// Livestock 
    const CATEGORY_VEGETABLES = 'vegetables';
    const CATEGORY_FRUITS = 'fruits';
    const CATEGORY_GRAINS = 'grains';
    const CATEGORY_DAIRY = 'dairy';
    const CATEGORY_SPICES = 'spices';
    const CATEGORY_SEAFOOD = 'seafood';
    const CATEGORY_POULTRY = 'poultry';
    const CATEGORY_LIVESTOCK = 'livestock';

    public static function getCategories()
    {
        return [
            self::CATEGORY_VEGETABLES,
            self::CATEGORY_FRUITS,
            self::CATEGORY_GRAINS,
            self::CATEGORY_DAIRY,
            self::CATEGORY_SPICES,
            self::CATEGORY_SEAFOOD,
            self::CATEGORY_POULTRY,
            self::CATEGORY_LIVESTOCK,
        ];
    }

    // Product status
    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_OUT_OF_STOCK = 'out_of_stock';

    // Relationships
    public function farmer()
    {
        return $this->belongsTo(User::class, 'farmer_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Accessors
    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeInStock($query)
    {
        return $query->where('quantity', '>', 0);
    }
}