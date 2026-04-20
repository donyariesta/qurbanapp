<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->after('name');
            $table->boolean('is_active')->default(true)->after('password');
        });

        DB::table('users')
            ->whereNull('username')
            ->orderBy('id')
            ->get(['id', 'name', 'email'])
            ->each(function (object $user): void {
                $base = preg_replace('/[^a-z0-9]+/i', '_', strtolower((string) ($user->name ?: $user->email ?: 'user')));
                $base = trim((string) $base, '_');
                $base = $base !== '' ? $base : 'user';
                $candidate = $base;
                $counter = 1;

                while (DB::table('users')->where('username', $candidate)->exists()) {
                    $counter++;
                    $candidate = "{$base}_{$counter}";
                }

                DB::table('users')->where('id', $user->id)->update(['username' => $candidate]);
            });

        Schema::table('users', function (Blueprint $table) {
            $table->unique('username');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
            $table->dropColumn(['username', 'is_active']);
        });
    }
};
