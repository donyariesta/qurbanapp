<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('meat_yield', function (Blueprint $table) {
            $table->dropColumn('status');
        });
        Schema::table('meat_yield', function (Blueprint $table) {
            $table->enum('status', ['meat', 'bone', 'insider', 'skin', 'head', 'feet'])
                ->default('meat');
        });
    }

    public function down(): void
    {
        Schema::table('meat_yield', function (Blueprint $table) {
            $table->dropColumn('status');
        });
        Schema::table('meat_yield', function (Blueprint $table) {
           $table->enum('status', ['gross', 'net'])->default('net');
        });
    }
};
