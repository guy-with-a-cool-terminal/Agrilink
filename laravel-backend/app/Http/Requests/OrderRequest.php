<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'delivery_address' => 'required|string|max:500',
            'delivery_date' => 'nullable|date|after:now',
            'notes' => 'nullable|string|max:500',
            'payment_method' => 'nullable|in:cash,card,mobile_money,bank_transfer',
            'priority' => 'nullable|in:low,medium,high,urgent',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'At least one item is required',
            'items.array' => 'Items must be provided as an array',
            'items.min' => 'At least one item is required',
            'items.*.product_id.required' => 'Product ID is required for each item',
            'items.*.product_id.exists' => 'Selected product does not exist',
            'items.*.quantity.required' => 'Quantity is required for each item',
            'items.*.quantity.integer' => 'Quantity must be a whole number',
            'items.*.quantity.min' => 'Quantity must be at least 1',
            'delivery_address.required' => 'Delivery address is required',
            'delivery_date.date' => 'Please provide a valid delivery date',
            'delivery_date.after' => 'Delivery date must be in the future',
            'payment_method.in' => 'Invalid payment method selected',
            'priority.in' => 'Invalid priority level selected',
        ];
    }
}