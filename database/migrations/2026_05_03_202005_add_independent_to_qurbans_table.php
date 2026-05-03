<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('qurbans', function (Blueprint $table) {
            $table->boolean('independent')->default(false)->after('quota')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('qurbans', function (Blueprint $table) {
            Schema::table('qurbans', function (Blueprint $table) {
            $table->dropIndex(['independent']);
            $table->dropColumn('independent');
        });
        });
    }
};
