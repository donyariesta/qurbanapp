<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DevSystemAdminSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->isLocal()) {
            return;
        }

        $adminRole = Role::query()->where('slug', 'system_admin')->first();
        if (! $adminRole) {
            return;
        }

        $username = env('DEV_SYSTEM_ADMIN_USERNAME', 'dev-admin');
        $email = env('DEV_SYSTEM_ADMIN_EMAIL', 'dev-admin@example.com');
        $password = env('DEV_SYSTEM_ADMIN_PASSWORD', 'dev-admin-password');

        User::query()->updateOrCreate(
            ['username' => $username],
            [
                'name' => 'System Administrator',
                'email' => $email,
                'password' => Hash::make($password),
                'role_id' => $adminRole->id,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}
