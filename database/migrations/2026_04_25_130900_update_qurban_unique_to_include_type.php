<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('qurbans', function (Blueprint $table) {
            $table->dropUnique('qurbans_event_id_qurban_number_unique');
            $table->unique(['event_id', 'qurban_number', 'qurban_type'], 'qurbans_event_number_type_unique');
        });
    }

    public function down(): void
    {
        Schema::table('qurbans', function (Blueprint $table) {
            $table->dropUnique('qurbans_event_number_type_unique');
            $table->unique(['event_id', 'qurban_number'], 'qurbans_event_id_qurban_number_unique');
        });
    }
};
