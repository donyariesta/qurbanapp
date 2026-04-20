<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->boolean('accumulate_cows_yield_meat')->default(false)->after('year');
            $table->unsignedInteger('total_pax_distribution')->default(1)->after('accumulate_cows_yield_meat');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['accumulate_cows_yield_meat', 'total_pax_distribution']);
        });
    }
};
