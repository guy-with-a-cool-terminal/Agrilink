<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('reviewer_id')->constrained('users')->onDelete('cascade'); // Who wrote the review
            $table->foreignId('reviewee_id')->constrained('users')->onDelete('cascade'); // Who is being reviewed
            $table->integer('rating')->unsigned(); // 1-5 stars
            $table->text('comment')->nullable();
            $table->enum('status', ['pending', 'approved', 'flagged', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Indexes for performance
            $table->index(['order_id', 'reviewer_id']);
            $table->index(['reviewee_id', 'status']);
            $table->index(['status', 'created_at']);
            
            // Ensure one review per user per order
            $table->unique(['order_id', 'reviewer_id', 'reviewee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};