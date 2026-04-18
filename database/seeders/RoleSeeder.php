<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::query()->updateOrCreate(
            ['slug' => 'system_admin'],
            ['name' => 'System Admin']
        );

        Role::query()->updateOrCreate(
            ['slug' => 'operator'],
            ['name' => 'Operator']
        );
    }
}
