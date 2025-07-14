<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PromotionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'start_date' => 'required|date|after_or_equal:now',
            'end_date' => 'required|date|after:start_date',
            'status' => 'nullable|in:active,inactive,expired',
            'applicable_to' => 'required|in:all,farmers,consumers,retailers',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Promotion title is required',
            'description.required' => 'Promotion description is required',
            'discount_percentage.numeric' => 'Discount percentage must be a number',
            'discount_percentage.min' => 'Discount percentage cannot be negative',
            'discount_percentage.max' => 'Discount percentage cannot exceed 100%',
            'discount_amount.numeric' => 'Discount amount must be a number',
            'discount_amount.min' => 'Discount amount cannot be negative',
            'start_date.required' => 'Start date is required',
            'start_date.after_or_equal' => 'Start date cannot be in the past',
            'end_date.required' => 'End date is required',
            'end_date.after' => 'End date must be after start date',
            'applicable_to.required' => 'Applicable user type is required',
            'applicable_to.in' => 'Invalid applicable user type',
            'min_order_amount.numeric' => 'Minimum order amount must be a number',
            'max_discount_amount.numeric' => 'Maximum discount amount must be a number',
        ];
    }

    public function prepareForValidation()
    {
        // Ensure at least one discount type is provided
        if (!$this->discount_percentage && !$this->discount_amount) {
            $this->merge([
                'discount_validation_error' => 'Either discount percentage or discount amount is required'
            ]);
        }
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if (!$this->discount_percentage && !$this->discount_amount) {
                $validator->errors()->add('discount_percentage', 'Either discount percentage or discount amount is required');
            }
        });
    }
}