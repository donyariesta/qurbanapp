<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id('event_id');
            $table->unsignedInteger('year')->unique();
            $table->timestamps();
        });

        Schema::create('submitters', function (Blueprint $table) {
            $table->id('submitter_id');
            $table->foreignId('event_id')
                ->constrained('events', 'event_id')
                ->cascadeOnDelete();
            $table->string('name');
            $table->text('address');
            $table->string('phone_number', 30);
            $table->timestamps();
        });

        Schema::create('qurbans', function (Blueprint $table) {
            $table->id('qurban_id');
            $table->foreignId('event_id')
                ->constrained('events', 'event_id')
                ->cascadeOnDelete();
            $table->unsignedInteger('qurban_number');
            $table->enum('qurban_type', ['Cow', 'Sheep']);
            $table->decimal('qurban_price', 12, 2);
            $table->decimal('qurban_shared_price', 12, 2);
            $table->unsignedInteger('quota');
            $table->timestamps();

            $table->unique(['event_id', 'qurban_number']);
        });

        Schema::create('participants', function (Blueprint $table) {
            $table->id('participant_id');
            $table->foreignId('event_id')
                ->constrained('events', 'event_id')
                ->cascadeOnDelete();
            $table->foreignId('submitter_id')
                ->constrained('submitters', 'submitter_id')
                ->cascadeOnDelete();
            $table->foreignId('qurban_id')
                ->constrained('qurbans', 'qurban_id')
                ->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->text('address');
            $table->timestamps();
        });

        Schema::create('procurements', function (Blueprint $table) {
            $table->id('procurement_id');
            $table->foreignId('event_id')
                ->constrained('events', 'event_id')
                ->cascadeOnDelete();
            $table->string('item');
            $table->decimal('price', 12, 2);
            $table->unsignedInteger('quantity');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id('transaction_id');
            $table->foreignId('event_id')
                ->constrained('events', 'event_id')
                ->cascadeOnDelete();
            $table->foreignId('submitter_id')
                ->constrained('submitters', 'submitter_id')
                ->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->date('date_of_payment');
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('reference_type')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('procurements');
        Schema::dropIfExists('participants');
        Schema::dropIfExists('qurbans');
        Schema::dropIfExists('submitters');
        Schema::dropIfExists('events');
    }
};
