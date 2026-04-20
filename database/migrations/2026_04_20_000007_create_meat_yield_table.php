<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meat_yield', function (Blueprint $table) {
            $table->id('meat_yield_id');
            $table->foreignId('qurban_id')->constrained('qurbans', 'qurban_id')->cascadeOnDelete();
            $table->unsignedInteger('weighing_sequence');
            $table->decimal('weigh', 12, 2);
            $table->enum('status', ['gross', 'net'])->default('net');
            $table->timestamps();

            $table->index(['qurban_id', 'weighing_sequence']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meat_yield');
    }
};
