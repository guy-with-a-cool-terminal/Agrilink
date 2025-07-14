<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->text('delivery_address');
            $table->timestamp('scheduled_date')->nullable();
            $table->timestamp('delivered_date')->nullable();
            $table->enum('status', ['assigned', 'in_transit', 'delivered', 'failed', 'returned'])->default('assigned');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->string('tracking_number')->unique();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['assigned_to', 'status']);
            $table->index('tracking_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};