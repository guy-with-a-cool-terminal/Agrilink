
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'delivery_address' => 'required|string|max:500',
            'delivery_date' => 'nullable|date|after_or_equal:today',
            'phone' => 'required|string|max:20',
            'payment_method' => 'required|in:cash_on_delivery,mobile_money,card,bank_transfer',
            'total_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'mpesa_phone' => 'nullable|string|max:15',
            'card_details' => 'nullable|array',
            'card_details.card_number' => 'nullable|string',
            'card_details.expiry_date' => 'nullable|string',
            'card_details.cardholder_name' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'payment_method.in' => 'Invalid payment method selected. Please choose from: Cash on Delivery, M-Pesa, Card, or Bank Transfer.',
            'items.*.product_id.exists' => 'One or more selected products do not exist.',
            'delivery_date.after_or_equal' => 'Delivery date must be today or in the future.',
        ];
    }
}
