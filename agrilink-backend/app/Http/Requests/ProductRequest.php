<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'farmer';
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'category' => 'required|in:vegetables,fruits,grains,dairy,spices','seafood','poultry','livestock',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'nullable|in:active,inactive,out_of_stock',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required',
            'category.required' => 'Product category is required',
            'category.in' => 'Invalid product category',
            'price.required' => 'Product price is required',
            'price.numeric' => 'Price must be a valid number',
            'price.min' => 'Price cannot be negative',
            'quantity.required' => 'Product quantity is required',
            'quantity.integer' => 'Quantity must be a whole number',
            'quantity.min' => 'Quantity cannot be negative',
            'image.image' => 'File must be an image',
            'image.mimes' => 'Image must be jpeg, png, jpg, or gif format',
            'image.max' => 'Image size cannot exceed 2MB',
        ];
    }
}