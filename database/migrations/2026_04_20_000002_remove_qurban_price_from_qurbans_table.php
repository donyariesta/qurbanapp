<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('qurbans', function (Blueprint $table) {
            if (Schema::hasColumn('qurbans', 'qurban_price')) {
                $table->dropColumn('qurban_price');
            }
        });
    }

    public function down(): void
    {
        Schema::table('qurbans', function (Blueprint $table) {
            if (! Schema::hasColumn('qurbans', 'qurban_price')) {
                $table->decimal('qurban_price', 12, 2)->default(0)->after('qurban_type');
            }
        });
    }
};
